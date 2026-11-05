{
  // var sTimeS = new Date();
  let calendar = [];
  let e3time = ["", "", ""];
  let e3title = ["", "", ""];
  //let current = [];
  //let next = [];
  //let gh = g.getHeight();
  let gw = g.getWidth();
  let version = 'v8l5b4';
  let drawTimeout;
  let updateCalTimer;
  const locale = require("locale");


  let Layout = require("Layout");
  let layout = new Layout({
    type: "v", c: [
      {
        type: "h", c: [
          { type: "txt", fillx: 1, font: "Vector:12", label: "01.01\nSun 20", id: "date" },
          { type: "txt", fillx: 2, font: "Vector:46", label: "12:00", id: "time" }
        ]
      },
      {
        type: "v", c: [
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal111", align: -1 },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 1.2", id: "cal12", align: -1 },
          { type: "txt", fillx: 1, font: "6x8", label: "cal 1.3", id: "cal13", align: -1 }
        ]
      },
      {
        type: "v", c: [
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal211", align: -1 },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 2.2", id: "cal22", align: -1 },
          { type: "txt", fillx: 1, font: "6x8", label: "-", id: "cal23", align: -1 }
        ]
      },
      {
        type: "v", c: [
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal311", align: -1 },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 3.2", id: "cal32", align: -1 },
          { type: "txt", fillx: 1, font: "6x8", label: "cal 3.3", id: "cal33", align: -1 }
        ]
      }
    ]
  }, { lazy: true });
  // layout.update();

  let zp = function (str) {
    return ("0" + str).slice(-2);
  };

  let drawClock = function () {
    // update time and date
    var d = getTime();
    layout.time.label = require("locale").time(d, 1);
    layout.date.label = zp(d.getDate()) + "." + zp(d.getMonth() + 1) + "\n" + (require("locale").dow(d, 1)) + " " + calendar.length;
    //layout.update();
  };

  let isActive = function (event) {
    var timeActive = getTime() - event.timestamp;
    return timeActive >= 0 && timeActive <= event.durationInSeconds;
  };

  let cutText = function (text,font) {
    let lines = g.setFont(font).wrapString(text, gw - g.stringWidth("<"));
    if (lines.length > 1) {
      lines = lines.slice(0, 2);
      lines[0] += "<";
    }
    return lines[0];
  };

  let eBack = function (event, row) {
    let prefix = 'cal' + row;
    layout[prefix + '2'].col = isActive(event) ? '#fff' : g.theme.fg;
    layout[prefix + '2'].bgCol = isActive(event) ? '#000' : g.theme.bg;
  };

  let updateCalendar = function () {
    calendar = require("Storage").readJSON("android.calendar.json", true) || [];
    let calendar2 = calendar.filter(e => isActive(e) || getTime() <= e.timestamp);
    calendar2 = calendar2.sort((a, b) => a.timestamp - b.timestamp);
    calendar = calendar2;
    if (updateCalTimer) clearTimeout(updateCalTimer);
    updateCalTimer = setTimeout(function () {
      updateCalTimer = undefined;
      updateCalendar();
    }, (10 * 55000) - (Date.now() % (10 * 55000)));
  };

  let drawEvent = function (event, row) {
    var time = new Date(event.timestamp * 1000);
    var timeEnd = new Date(time.getTime() + (event.durationInSeconds / 60) * 60000);
    var timeStr = "";

    // Event Header (time + date)
    timeStr = zp(time.getHours()) + ":" + zp(time.getMinutes()) + " " + zp(time.getDate()) + '.' + zp(time.getMonth() + 1) + " | " + zp(timeEnd.getHours()) + ":" + zp(timeEnd.getMinutes()) + " " + zp(timeEnd.getDate()) + "." + zp(timeEnd.getMonth() + 1);

    let now = new Date();
    now = Date(now.setMilliseconds(0));
    if (time == now) {
      Bangle.buzz(600, 0.2);
    }

    eBack(event, row);

    if (event.timestamp != e3time[row - 1] || event.title != e3title[row - 1]) {
      e3time[row - 1] = event.timestamp;
      e3title[row - 1] = event.title;

      layout['cal' + row.toString() + '11'].label = timeStr;

      layout['cal' + row.toString() + '2'].label = cutText(event.title,"Vector:13");
      // layout['cal' + row.toString() + '2'].label = cutText(event.title);

      if (event.location) {
        layout['cal' + row.toString() + '3'].label = cutText(">" + event.location,"6x8");
      } else {
        layout['cal' + row.toString() + '3'].label = "";
      }
    }
  };

  let drawFutureEvents = function () {
    let y = 1;
    for (let e of calendar) {
      let expiredE = new Date(e.timestamp * 1000 + e.durationInSeconds * 1000);
      if (expiredE < Date.now()) {
        continue;
      } else {
        drawEvent(e, y);
        y++;
      }
      if (y > 3) {
        break;
      }
    }
    if (y < 4) {
      for (let j = y; j < 4; j++) {
        let p = 'cal' + j.toString();
        if (e3time[j - 1] !== "" || layout[p + '11'].label != "") {
          layout[p + '11'].label = "";
          layout[p + '2'].label = "";
          layout[p + '2'].col = g.theme.fg;
          layout[p + '2'].bgCol = g.theme.bg;
          layout[p + '3'].label = "";
          e3time[j - 1] = "";
          e3title[j - 1] = "";
        }

      }
    }
  };

  let fullRedraw = function () {
    g.reset();
    let d = new Date();
    layout.time.label = locale.time(d, 1);
    layout.date.label = `${zp(d.getDate())}.${zp(d.getMonth() + 1)}\n${locale.dow(d, 1)} ${calendar.length}`;
    drawFutureEvents();

    layout.render();
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(fullRedraw, 60000 - (Date.now() % 60000));
  };

  Bangle.setUI({
    mode: "clock",
    remove: function () {
      if (drawTimeout) clearTimeout(drawTimeout);
      if (updateCalTimer) clearTimeout(updateCalTimer);
      // remove info
      Layout = layout = e3time = e3title = drawTimeout = calendar = updateCalTimer = undefined;
    }

  });
  // loadWidgets after setUI (so widgets know a clock is running) and before the
  // first layout render (Layout reads Bangle.appRect, which depends on widgets)
  Bangle.loadWidgets();
  updateCalendar();
  g.clear();
  fullRedraw();
  setTimeout(Bangle.drawWidgets, 0);

}


