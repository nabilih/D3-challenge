// @TODO: YOUR CODE HERE!

//initial Axis data
let chosenXAxis = 'age';
let chosenYAxis = 'obesity';

var svgWidth = 900;
var svgHeight = 700;

var margin = {
  top: 40,
  right: 40,
  bottom: 110,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create X axis scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8, d3.max(data, d => d[chosenXAxis]) * 1.2 ])
      .range([0, width]);
    return xLinearScale;  
  }

function yScale(data, chosenYAxis) {
    // create Y axis scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8, d3.max(data, d => d[chosenYAxis]) * 1.2 ])
      .range([height, 0]);
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function render_X_Axes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
function render_Y_Axes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

//function for updating STATE labels
function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]))
      .text(function(d){return d.abbr});
    return textGroup
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    var yLabel;

    if (chosenXAxis === "age") {
        xLabel = "Age:";
    }
    else if (chosenXAxis === "income") {
        xLabel = "Income:";
    }
    else {
        xLabel = "Poverty:";
    }

    if (chosenYAxis === "obesity") {
        yLabel = "Obesity";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
    }
    else {
        yLabel = "Lacks Healthcare:";
    };

    // var toolTip = d3.tip()
    //   .attr("class", "d3-tip")
    //   .offset([80, -60])
    //   .html(function(d) {
    //     return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    //   });
 
    // circlesGroup.call(toolTip);
  
    // circlesGroup.on("mouseover", function(data) {
    //   toolTip.show(data);
    // })
    //   // onmouseout event
    //   .on("mouseout", function(data, index) {
    //     toolTip.hide(data);
    //   });
  
    return circlesGroup;
}

// import data
d3.csv('assets/data/data.csv').then(function(data) {
    // uncomment line below to check the data in console
    //console.log(data);

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(person) {
        person.obesity = +person.obesity;
        person.income = +person.income;
        person.age = +person.age;
        person.smokes = +person.smokes;
        person.healthcare = +person.healthcare;
        person.poverty = +person.poverty;
    });

    // Step 2: Create scales for X and Y using the functions above import data
    // ==============================
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    //append X axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create Circles and texts
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed('stateCircle', true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "10")
    .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll('.stateText')
      .data(data)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    //create a group for the x axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //create a group for Y axis labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    // Create X axis labels
    var ageLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed('active', true)
        .classed('inactive', false)
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')   // value to grab for event listener
        .text('Age (Median)'); 

    var incomelabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', false)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')  // value to grab for event listener
        .text('Household Income (Median)');

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', false)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 80)
        .attr('value', 'poverty')   // value to grab for event listener
        .text('In Poverty (%)');

    // Create Y axis labels
    var obesityLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .classed('inactive', false)
        .attr('x', 0)
        .attr('y', 0 - 50)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')  // value to grab for event listener
        .text('Obese (%)');

    var smokesLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', false)
        .classed('inactive', true)
        .attr('x', 5)
        .attr('y', 0 - 70)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')  // value to grab for event listener
        .text('Smokes (%)');

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', false)
        .classed('inactive', true)
        .attr('x', 10)
        .attr('y', 0 - 90)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')  // value to grab for event listener
        .text('Lacks Healthcare (%)');

    // set tool tip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);
        
            // updates x axis with transition
            xAxis = render_X_Axes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            //updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomelabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            };
            if (chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomelabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            };
            if (chosenXAxis === "poverty") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomelabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false); 
            };
        }; // if (value !== chosenXAxis)
    });  // on click

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(data, chosenYAxis);
        
            // updates y axis with transition
            yAxis = render_Y_Axes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            };
            if (chosenYAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            };
            if (chosenYAxis === "healthcare") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false); 
            };
        } // if (value !== chosenYAxis) 
    });  //on click for y axis

}).catch(function(error) {
    console.log(error);
});
