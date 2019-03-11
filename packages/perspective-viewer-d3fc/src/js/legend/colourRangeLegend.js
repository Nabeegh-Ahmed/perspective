/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import * as fc from "d3fc";
import {getOrCreateElement} from "../utils/utils";

export function colourRangeLegend() {
    const width = 100;
    const height = 150;
    let scale = null;

    const xScale = d3
        .scaleBand()
        .domain([0, 1])
        .range([0, width]);

    const formatFunc = d => (Number.isInteger(d) ? d3.format(",.0f")(d) : d3.format(",.2f")(d));

    function legend(container) {
        const domain = scale.domain();
        const pad = (domain[1] - domain[0]) * 0.1;
        const min = domain[0] - pad;
        const max = domain[1] + pad;
        const expandedDomain = d3.range(min, max, (max - min) / height);

        const yScale = d3
            .scaleLinear()
            .domain(fc.extentLinear()(expandedDomain))
            .range([height, 0]);

        const svgBar = fc
            .autoBandwidth(fc.seriesSvgBar())
            .xScale(xScale)
            .yScale(yScale)
            .crossValue(0)
            .baseValue((_, i) => (i > 0 ? expandedDomain[i - 1] : 0))
            .mainValue(d => d)
            .decorate(selection => {
                selection.selectAll("path").style("fill", d => scale(d));
            });

        const axisLabel = fc
            .axisRight(yScale)
            .tickValues([...domain, (domain[1] + domain[0]) / 2])
            .tickSizeOuter(0)
            .tickFormat(d => formatFunc(d));

        const legendSelection = getOrCreateElement(container, "div.legend-container", () =>
            container
                .append("div")
                .attr("class", "legend-container")
                .style("z-index", "2")
        );

        const legendSvg = getOrCreateElement(legendSelection, "svg", () => legendSelection.append("svg"))
            .style("width", width)
            .style("height", height);
        const legendBar = getOrCreateElement(legendSvg, "g", () => legendSvg.append("g"))
            .datum(expandedDomain)
            .call(svgBar);

        const barWidth = Math.abs(legendBar.node().getBBox().x);
        getOrCreateElement(legendSvg, "#legend-axis", () => legendSvg.append("g").attr("id", "legend-axis"))
            .attr("transform", `translate(${barWidth})`)
            .datum(expandedDomain)
            .call(axisLabel)
            .select(".domain")
            .attr("visibility", "hidden");
    }

    legend.scale = (...args) => {
        if (!args.length) {
            return scale;
        }
        scale = args[0];
        return legend;
    };

    return legend;
}
