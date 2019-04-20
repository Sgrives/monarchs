$.getJSON("dataset.json", function(data) { render(data) });

// Colors
var detailsColor = "#E2D4AC",
  backgroundColor = "#FEF6DF",
  thumbnailBackgroundColor = "#000000",
  thumbnailNameBackgroundColor = "#4E4E4E",
  strokeColor = "#000000",
  dateLineColor = "#858585",
  dateColors = {
    "science": "#4DCB93",
    "culture": "#E7A2F7",
    "military": "#E67777",
    "catastrophe": "#CECECE",
    "philosophy": "#FFA600",
    "diplomacy": "#0B8AE8"
  };

var fillColors = {
  "England": {
    "Tudor": "#171A94",
    "Grey": "#0BC0E8",
    "Stuart": "#4DCB93",
    "Orange-Nassau": "#0BC0E8",
    "Hanover": "#0B8AE8",
    "Saxe-Coburg and Gotha": "#0074E9",
    "Windsor": "#0162C3",
    "York": "#79D8F9",
    "Lancaster": "#A2F4F2",
    "Plantagenet": "#94CAC9",
    "Plantagenet/Angevin": "#6E9796",
    "Blois": "#CECECE",
    "Normandy": "#506D6D"
  },
  "Scotland": {
    "Stuart": "#4DCB93",
    "Balliol": "#CECECE",
    "Bruce": "#2AB075"
  },
  "France": {
    "Capet": "#6F5176",
    "Valois": "#E7A2F7",
    "Bourbon": "#CD06FC",
    "Valois-Angouleme": "#F6D8FD",
    "Valois-Orleans": "#F0BDFC",
    "Bonaparte": "#4C025D",
    "Orleans": "#F0BDFC"
  },
  "Holy Roman Empire": {
    "Habsburg": "#FFA600",
    "Wittelsbach": "#F1C716",
    "Habsburg-Lorraine": "#FF7C00",
    "Lorraine": "#FF4D00",
    "Carolingian": "#CA9100",
    "Widonid": "#CECECE",
    "Bosonid": "#CECECE",
    "Unruoching": "#CECECE",
    "Ottonian": "#D6C08E",
    "Salian": "#D9CDB4",
    "Supplinburg": "#CECECE",
    "Staufen": "#855C06",
    "Welf": "#CECECE",
    "Luxembourg": "#B7B698",
    "Hohenzollern": "#1B1B0C"
  },
  "Spain": {
    "Habsburg": "#FFA600",
    "Bourbon": "#CD06FC",
    "Bonaparte": "#4C025D",
    "Franco": "#CECECE",
    "Savoy": "#C3CC00"
  },
  "Italy": {
    "Savoy": "#C3CC00"
  },
  "Russia": {
    "Rurik": "#E67777",
    "Godunov": "#CECECE",
    "Shuyskiy": "#CECECE",
    "Vasa": "#CECECE",
    "Romanov": "#5D0C12",
    "Holstein-Gottorp-Romanov": "#450006"
  }
};

// Fonts
var fontSizeLarge = "1.9em",
  fontSizeMedium = "1.5em",
  fontSizeSmall = "1em",
  fontFamily = "Georgia, serif",
  strokeWidthLarge = 15,
  strokeWidthMedium = 10,
  strokeWidthSmall = 5,
  strokeWidthTiny = 1,
  cornerRadiusSmall = 5,
  cornerRadiusLarge = 15,
  circleRadiusSmall = 3,
  circleRadiusLarge = 8,
  pixelsPerCharacterReference = { // Somehow calc this from width/height and multiply by sm/md/lg modifier
    "small": 10,
    "medium": 15,
    "large": 20
  };

// General config
var width = window.innerWidth,
  height = window.innerHeight,
  margin = { top: height / 8, bottom: height / 4, right: width / 12, left: width / 12 };

// Details config
var detailsHeight = height / 4 * 3,
  detailsWidth = detailsHeight * 2 / 3,
  detailsMargin = detailsHeight / 48,
  detailsHeightInterval = (detailsHeight - 2 * detailsMargin) / 7, // TODO: Be more consistent about this vs. detailsLineHeight
  detailsWidthInterval = (detailsWidth - 2 * detailsMargin) / 12,
  detailsLineHeight = detailsHeightInterval / 4, // Maximum height of a line of text
  detailsX = (width - detailsWidth) / 2,
  detailsY = (height - detailsHeight) / 2,
  detailsMiddle = detailsX + detailsWidth / 2,
  detailsImageHeight = detailsHeightInterval * 2,
  detailsImageWidth = detailsImageHeight,
  detailsImageX = detailsX + detailsWidthInterval,
  detailsImageY        = detailsY + detailsMargin,
  detailsNameY         = detailsY + 2 * detailsHeightInterval + detailsMargin,
  detailsEventsY       = detailsY + 3 * detailsHeightInterval + detailsMargin,
  detailsWarsY         = detailsY + 4 * detailsHeightInterval + detailsMargin,
  detailsRelationshipY = detailsY + 5 * detailsHeightInterval + detailsMargin;

// Thumbnail config
var thumbnailImageWidth = width / 8,
  thumbnailBorder = 10;

// Date config
var dateHeight = detailsLineHeight,
  dateWidth = dateHeight * 8;

function render(data) {

  // Stores dates and remove from data object; render later
  var dates = data["Dates"];
  delete(data["Dates"]);

  // Flatten all reigns into a single array to determine start and end
  var firstYear = d3.min(_.flatten(_.map(data, function(countryData, countryName) { return _.map(countryData, function(monarchData, monarchName) { return monarchData.start; }); })));
    lastYear = d3.max(_.flatten(_.map(data, function(countryData, countryName) { return _.map(countryData, function(monarchData, monarchName) { return monarchData.end; }); })));
    pixelsPerYear = (width - margin.left - margin.right) / (lastYear - firstYear);

  var detailsOpen = false,
    countryIndex = 0,
    countryCount = _.keys(data).length,
    laneHeight = height / countryCount / 4;

  // Create Timeline
  var timeline = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "timeline")

  // Timeline background
  timeline.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", backgroundColor)

  // Create X-axis
  var xScale = d3.time.scale()
    .domain([firstYear, lastYear]) 
    .range([margin.left, width - margin.right]);

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  timeline.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(xAxis);

  // Add dates
  timeline.append("g")
    .selectAll("circle")
    .data(_.map(dates, function(data, year) { return data; }))
    .enter()
    .append("circle")
    .attr("cx", function(d) { return margin.left + (d.date - firstYear) * pixelsPerYear; })
    .attr("cy", height - margin.bottom - laneHeight / 2)
    .attr("r", circleRadiusSmall)
    .attr("fill", function(data) { return dateColors[data.type] })
    .on("mouseover", renderDate)
    .on("mouseout", function() {
      d3.select(this).transition().attr("r", circleRadiusSmall);
      timeline.selectAll(".date").remove();
    })

  function renderDate(data, i) {
    var circle = d3.select(this),
      dateTextPadding = 6,
      dateTextString = data.date + ": " + data.event,
      dateRectWidth,
      dateRectHeight;

    [dateTextWidth, dateTextHeight] = getContainerFromText(dateTextString, "small");
    var dateRectWidth = dateTextWidth + dateTextPadding * 2,
      dateRectHeight = dateTextHeight + dateTextPadding * 2;


    var dateRect = timeline.append("rect")
      .attr("x", margin.left + (data.date - firstYear) * pixelsPerYear - dateRectWidth / 2)
      .attr("y", height - margin.bottom + laneHeight / 2)
      .attr("rx", cornerRadiusSmall)
      .attr("ry", cornerRadiusSmall)
      .attr("width", dateRectWidth)
      .attr("height", detailsLineHeight)
      .attr("fill", dateColors[data.type])
      .attr("fill-opacity", 0.75)
      .attr("stroke", dateColors[data.type])
      .attr("stroke-width", strokeWidthTiny)
      .attr("class", "date ")

    var dateText = timeline.append("text")
      .attr("x", margin.left + (data.date - firstYear) * pixelsPerYear)
      .attr("y", height - margin.bottom + laneHeight / 2 + detailsLineHeight * 3 / 4)
      .attr("text-anchor", "middle")
      .attr("class", "date ")
      .text(dateTextString)

    circle.transition().attr("r", circleRadiusLarge)

    timeline.append("line")
      .attr("x1", circle.attr("cx"))
      .attr("y1", circle.attr("cy") - laneHeight / 4)
      .attr("x2", circle.attr("cx"))
      .attr("y2", margin.top)
      .attr("stroke", dateLineColor) 
      .attr("stroke-width", strokeWidthTiny)
      .attr("opacity", 0.5)
      .attr("class", "date")
  };

  // Create country timelines
  _.forEach(data, function(countryData, countryName) {
    countryIndex += 1;

    // Add legend
    timeline.append("text")
      .attr("x", margin.left / 10)
      .attr("y", height - margin.bottom - countryIndex * laneHeight * 2 + laneHeight / 2)
      .attr("font-family", fontFamily)
      .attr("font-size", fontSizeSmall)
      .attr("class", "legend")
      .text(countryName);

    // Add blocks
    timeline.append("g")
      .attr('id', countryName)
      .selectAll("rect")
      .data(_.map(countryData, function(monarchData, monarchName) { return monarchData; }))
      .enter()
      .append("rect")
      .attr("width", function(data) { return (data.end - data.start) * pixelsPerYear - 1 })
      .attr("height", laneHeight)
      .attr("x", function(data) { return margin.left + (data.start - firstYear) * pixelsPerYear })
      .attr("y", height - margin.bottom - countryIndex * laneHeight * 2)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", function(data) { return fillColors[countryName][data.house] || "maroon"})
      .attr("fill-opacity", 0.75)
      .attr("class", "block")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", showDetail)

    // Append detail to lay it on top of blocks
    detail = timeline.append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("fill", detailsColor)
      .attr("rx", cornerRadiusLarge)
      .attr("ry", cornerRadiusLarge)
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidthMedium)
      .on("click", hideDetail)
    });

  function handleMouseOver(el, i) {
    if (detailsOpen) return false

    enlargeBlock.bind(d3.select(this))(this);
    showThumbnail.bind(this)(el);
  };

  function handleMouseOut(el, i) {
    if (detailsOpen) return false

    timeline.selectAll(".thumbnail").remove();
    reduceBlock.bind(d3.select(this))(this);
  };

  function showThumbnail(el) {
    var $this = $(this),
      $x = parseFloat($this.attr('x')),
      $y = parseFloat($this.attr('y')),
      $width = $this.width(),
      $height = $this.height();


    var thumbnailDimensions = [
      { // Background
        "x": $x + $width / 2 - thumbnailImageWidth / 2 - thumbnailBorder,
        "y": $y - thumbnailImageWidth - detailsLineHeight - thumbnailBorder,
        "width": thumbnailImageWidth + 2 * thumbnailBorder,
        "height": thumbnailImageWidth + 2 * thumbnailBorder
      },
      { // Image
        "x": $x + $width / 2 - thumbnailImageWidth / 2,
        "y": $y - thumbnailImageWidth - detailsLineHeight,
        "width": thumbnailImageWidth,
        "height": thumbnailImageWidth
      },
      { // Name background
        "x": $x + $width / 2 - thumbnailImageWidth / 2 + detailsWidthInterval / 2,
        "y": $y - thumbnailImageWidth / 5 - detailsLineHeight,
        "width": thumbnailImageWidth - detailsWidthInterval,
        "height": thumbnailImageWidth / 6
      },
      { // Name
        "x": $x + $width / 2,
        "y": $y - thumbnailImageWidth / 5 - detailsLineHeight + thumbnailImageWidth / 9,
        "width": thumbnailImageWidth,
        "height": thumbnailImageWidth
      }
    ];

    var thumbnailBackground = timeline.append("rect")
      .attr("x", $x + $width / 2)
      .attr("y", $y + laneHeight / 2)
      .attr("fill", thumbnailBackgroundColor)
      .attr("rx", cornerRadiusLarge)
      .attr("ry", cornerRadiusLarge)
      .attr("class", "thumbnail")

    var thumbnailImage = timeline.append("image")
      .attr("x", $x + $width / 2)
      .attr("y", $y + laneHeight / 2)
      .attr("xlink:href", el.image)
      .attr("preserveAspectRatio", "none")
      .attr("class", "thumbnail")

    var thumbnailNameBackground = timeline.append("rect")
      .attr("x", $x + $width / 2)
      .attr("y", $y + laneHeight / 2)
      .attr("fill", backgroundColor)
      .attr("rx", cornerRadiusLarge)
      .attr("ry", cornerRadiusLarge)
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidthTiny)
      .attr("class", "thumbnail")

    var thumbnailName = timeline.append("text")
      .attr("x", $x + $width / 2)
      .attr("y", $y + laneHeight / 2)
      .attr("font-family", fontFamily)
      .attr("font-size", fontSizeMedium)
      .attr("text-anchor", "middle")
      .attr("class", "thumbnail hidden")
      .text(el.name)

    timeline.selectAll('.thumbnail')
      .transition()
      .attr("x", function(d, i)      { return thumbnailDimensions[i]["x"] })
      .attr("y", function(d, i)      { return thumbnailDimensions[i]["y"] })
      .attr("width", function(d, i)  { return thumbnailDimensions[i]["width"] })
      .attr("height", function(d, i) { return thumbnailDimensions[i]["height"] }) 
      .on("end", function() { timeline.select("text.thumbnail").classed("hidden", false) })
  };

  function showDetail(data, i) {
    if (detailsOpen) return false
    if (!data.endReason) return false // For now, don't show details for monarchs without much data

    timeline.selectAll('.block').classed('inactive', true);
    timeline.selectAll('.legend').classed('inactive', true);
    detail.transition()
      .attr("width", detailsWidth)
      .attr("height", detailsHeight)
      .attr("x", detailsX)
      .attr("y", detailsY)
      .attr("fill-opacity", 1)
      .duration(300).on("end", function() { renderDetails(data); });
    handleMouseOut.bind(this)();
    detailsOpen = true;
  }

  function hideDetail(data, i) {
    timeline.selectAll('.block').classed('inactive', false);
    timeline.selectAll('.legend').classed('inactive', false);
    detailsOpen = false;
    detail.transition()
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", width / 2)
      .attr("y", height / 2)
    timeline.selectAll('.detail').remove();
  }

  function renderDetails(data) {
    // Monarch image
    timeline.append("image")
      .attr("x", detailsImageX)
      .attr("y", detailsImageY)
      .attr("width", detailsImageWidth)
      .attr("height", detailsImageHeight)
      .attr("xlink:href", data.image)
      .attr("preserveAspectRatio", "none")
      .attr("class", "detail")

    // House image
    timeline.append("image")
      .attr("x", detailsX + detailsWidth - detailsImageWidth * 3 / 4 - detailsWidthInterval)
      .attr("y", detailsImageY + detailsImageHeight / 4)
      .attr("width", detailsImageWidth / 2)
      .attr("height", detailsImageHeight / 2)
      .attr("xlink:href", data.houseImage)
      .attr("class", "detail")


    var nameAndHouseFontSize = _.min(
      _.map([data.name, data.house], function(text) {
        return getFontSizeFromContainer(text, detailsImageWidth, detailsLineHeight);
      })
    )

    // Name
    timeline.append("text")
      .attr("x", detailsImageX + detailsImageWidth / 2)
      .attr("y", detailsNameY + detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", nameAndHouseFontSize)
      .attr("class", "detail")
      .text(data.name);

    // House
    timeline.append("text")
      .attr("x", detailsX + detailsWidth - detailsImageWidth / 2 - detailsWidthInterval)
      .attr("y", detailsNameY + detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", nameAndHouseFontSize)
      .attr("class", "detail")
      .text(data.house);

    // Reign
    var reignString = data.start + " - " + data.end + " (" + data.endReason + ")",
      reignAndReligionFontSize = _.min(
        _.map([data.religion, reignString], function(text) {
          return getFontSizeFromContainer(text, detailsImageWidth * 2, detailsLineHeight);
        })
      )

    timeline.append("text")
      .attr("x", detailsMiddle)
      .attr("y", detailsNameY + 2 * detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", reignAndReligionFontSize)
      .attr("class", "detail")
      .text(reignString)

    // Religion
    timeline.append("text")
      .attr("x", detailsMiddle)
      .attr("y", detailsNameY + 3 * detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", reignAndReligionFontSize)
      .attr("class", "detail")
      .text(data.religion);

    // The `detailsImageWidth * 4` is purposefully wider than the details container to avoid bug in getFontSizeFromContainer
    var eventsAndWarsFontSize = _.min(
      _.map(data.events.concat(data.wars), function(text) {
        return getFontSizeFromContainer(text, detailsImageWidth * 4, (detailsHeightInterval - detailsLineHeight) * 2 / 9);
      })
    )

    // Events
    timeline.append("text")
      .attr("x", detailsMiddle)
      .attr("y", detailsEventsY + detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", getFontSizeFromContainer("Events", detailsImageWidth, detailsLineHeight))
      .attr("class", "detail")
      .text("Events")

    timeline.append("g").selectAll("text")
      .data(data.events)
      .enter()
      .append("text")
      .attr("x", detailsImageX)
      .attr("y", function(d, i) { return detailsEventsY + detailsLineHeight + (detailsHeightInterval - detailsLineHeight) * (1 + i) / 3; })
      .attr("font-family", fontFamily)
      .attr("font-size", eventsAndWarsFontSize)
      .attr("class", "detail")
      .text(function(d) { return d; })

    // Wars
    timeline.append("text")
      .attr("x", detailsMiddle)
      .attr("y", detailsWarsY + detailsLineHeight)
      .attr("text-anchor", "middle")
      .attr("font-family", fontFamily)
      .attr("font-size", getFontSizeFromContainer("Wars", detailsImageWidth, detailsLineHeight))
      .attr("class", "detail")
      .text("Wars")

    timeline.append("g").selectAll("text")
      .data(data.wars)
      .enter()
      .append("text")
      .attr("x", detailsImageX)
      .attr("y", function(d, i) { return detailsWarsY + detailsLineHeight + (detailsHeightInterval - detailsLineHeight) * (1 + i) / 3; })
      .attr("font-family", fontFamily)
      .attr("font-size", eventsAndWarsFontSize)
      .attr("class", "detail")
      .text(function(d) { return d; })
    
    // Relationships
    // 1/8i: padding
    // 1i: image
    // 1/8i: padding
    // 1/4i: each relationship component (3)
    var relationshipCount = data.relationships.length,
      relationshipContainerWidth = detailsWidth - detailsMargin * 2,
      relationshipMaxImageWidth = detailsHeightInterval,
      relationshipImageWidthCalculated = relationshipContainerWidth / relationshipCount / 1.5,
      relationshipImageWidth = Math.min(relationshipMaxImageWidth, relationshipImageWidthCalculated),
      relationshipImagePadding = relationshipImageWidth / 2;

    // i: index
    // c: relationship count
    // m: middle of details overlay
    // W: relationship image width
    // x(i, c) = m - (c - 1) * 0.75W + i * 1.5W - 0.5W
    _.map(data.relationships, function(rel, idx) {
      var relationshipImageX = detailsMiddle - (relationshipCount - 1) * 0.75 * relationshipImageWidth + idx * 1.5 * relationshipImageWidth - 0.5 * relationshipImageWidth;
      timeline.append("image")
        .attr("x", relationshipImageX)
        .attr("y", detailsRelationshipY + detailsHeightInterval / 8) // Just a little padding between wars and relationships
        .attr("width", relationshipImageWidth)
        .attr("height", relationshipImageWidth)
        .attr("xlink:href", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Nicolas_Cage_2011_CC.jpg/220px-Nicolas_Cage_2011_CC.jpg")
        .attr("class", "detail")

      var relationshipComponentFontSize = _.min(
        _.map(rel.split(","), function(text) {
          return getFontSizeFromContainer(text, detailsImageWidth * 2, detailsHeightInterval / 8);
        })
      );

      _.map(rel.split(","), function(relComponent, idx) {
        timeline.append("text")
          .attr("x", relationshipImageX + relationshipImageWidth / 2)
          .attr("y", detailsRelationshipY + relationshipImageWidth + detailsHeightInterval * (idx + 2) / 8)
          .attr("text-anchor", "middle")
          .attr("font-family", fontFamily)
          .attr("font-size", relationshipComponentFontSize)
          .attr("class", "detail")
          .text(relComponent);
      });
    });
  }
};

//////////////////////////////
// Stateless utility functions

// Creates array of objects for a monarch
function formatDetails(el) {
  var data = [];
  _.forEach(el, function(value, key) { return data.push({key: key, value: value}) });
  return data;
}

function enlargeBlock(el) {
  var $this = $(el),
    $x = parseFloat($this.attr('x')),
    $y = parseFloat($this.attr('y')),
    $width = $this.width(),
    $height = $this.height();

  this
    .attr("x", $x - 5)
    .attr("y", $y - 5)
    .attr("width", $width + 10)
    .attr("height", $height + 10)
    .attr("smallX", this.attr("smallX") || $x)
    .attr("smallY", this.attr("smallY") || $y)
    .attr("smallWidth", this.attr("smallWidth") || $width)
    .attr("smallHeight", this.attr("smallHeight") || $height)
    .attr("fill-opacity", 1.0);
}

function reduceBlock(el) {
  var $this = $(el);
  var $x = parseFloat($this.attr('x')),
    $y = parseFloat($this.attr('y')),
    $width = $this.width(),
    $height = $this.height();

  this
    .attr("x", this.attr("smallX"))
    .attr("y", this.attr('smallY'))
    .attr("width", this.attr('smallWidth'))
    .attr("height", this.attr('smallHeight'))
    .attr("fill-opacity", 0.75)
}

// Given some text and size, how should we draw a container around it?
function getContainerFromText(text, size) {
  var pixelsPerCharacter = pixelsPerCharacterReference[size],
    width = pixelsPerCharacter * text.length,
    height = pixelsPerCharacter;

  return [width, height];
}

// Given a container and text, what size should the font be?
function getFontSizeFromContainer(text, width, height) {
  var maxHeightPixels = height,
    maxWidthPixels = width / text.length * 1,
    // Bug: somehow width-bounding scales the text WAAAAY down for longer texts
    // I think it has to do with the proportion of width to height, so that fudge factor should be derived from those
    pixelSize = Math.floor(_.min([maxHeightPixels, maxWidthPixels]));

  // console.log(text + " => (" + maxWidthPixels + ", " + maxHeightPixels + ")");

  return pixelSize;
}

