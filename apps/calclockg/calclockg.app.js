{
  Bangle.loadWidgets();
  let calendar = [];
  let e3time = ["", "", ""];
  let e3title = ["", "", ""];
  let gw = g.getWidth();
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
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal111" },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 1.2", id: "cal12" },
          { type: "txt", fillx: 1, font: "6x8", label: "cal 1.3", id: "cal13" }
        ]
      },
      {
        type: "v", c: [
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal211" },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 2.2", id: "cal22" },
          { type: "txt", fillx: 1, font: "6x8", label: "-", id: "cal23" }
        ]
      },
      {
        type: "v", c: [
          { type: "txt", fillx: 1, font: "Vector:13", label: "Etime", id: "cal311" },
          { type: "txt", fillx: 1, font: "Vector:13", label: "cal 3.2", id: "cal32" },
          { type: "txt", fillx: 1, font: "6x8", label: "cal 3.3", id: "cal33" }
        ]
      }
    ]
  }, { lazy: true });
  // layout.update();

  let zp = function (str) {
    return ("0" + str).slice(-2);
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
  
  let buzzForEvents = function(event) {
    // No buzz for all day events or events before 7am
    // TODO: make this configurable
    if (event.allDay || (new Date(event.timestamp * 1000)).getHours() < 7) return;
    let minToEvent = Math.round((event.timestamp - getTime()) / 60.0);
    switch (minToEvent) {
      case 30: require("buzz").pattern(":"); break;
      case 15: require("buzz").pattern(", ,"); break;
      case 1: require("buzz").pattern(": : :"); break;
    }
  }

  let drawEvent = function (event, row) {
    var time = new Date(event.timestamp * 1000);
    var timeEnd = new Date(time.getTime() + (event.durationInSeconds / 60) * 60000);
    var timeStr = "";

    // Event Header (time + date)
    timeStr = zp(time.getHours()) + ":" + zp(time.getMinutes()) + " " + zp(time.getDate()) + '.' + zp(time.getMonth() + 1) + " | " + zp(timeEnd.getHours()) + ":" + zp(timeEnd.getMinutes()) + " " + zp(timeEnd.getDate()) + "." + zp(timeEnd.getMonth() + 1);

    buzzForEvents(event);
    eBack(event, row);

    if (event.timestamp != e3time[row - 1] || event.title != e3title[row - 1]) {
      e3time[row - 1] = event.timestamp;
      e3title[row - 1] = event.title;

      layout['cal' + row.toString() + '11'].label = timeStr;

      layout['cal' + row.toString() + '2'].label = cutText(event.title,"Vector:13");

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
        if (layout['cal' + j.toString() + '11'].label != "") {
          layout['cal' + j.toString() + '11'].label = "";
          layout['cal' + j.toString() + '2'].label = "";
          layout['cal' + j.toString() + '3'].label = "";
        }

      }
    }
  };

  let fullRedraw = function () {
    g.reset();
    let d = new Date();
    layout.time.label = locale.time(d, 1);
    layout.date.label = `${zp(d.getDate())}.${zp(d.getMonth() + 1)}\n${locale.dow(d, 1)}`;
    drawFutureEvents();

    layout.render();
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(fullRedraw, 60000 - (Date.now() % 60000));
  };

  updateCalendar();
  g.clear();
  fullRedraw();
  Bangle.setUI({
    mode: "clock",
    remove: function () {
      if (drawTimeout) clearTimeout(drawTimeout);
      if (updateCalTimer) clearTimeout(updateCalTimer);
      // remove info
      Layout = layout = e3time = e3title = drawTimeout = calendar = updateCalTimer = undefined;
    }

  });
  setTimeout(Bangle.drawWidgets, 0);

}


