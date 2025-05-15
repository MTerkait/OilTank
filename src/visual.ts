/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";

import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;

export class Visual implements IVisual {
    private target: HTMLElement;
    private svgContainer: HTMLElement;
    private initialized: boolean = false;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.svgContainer = document.createElement("div");
        this.target.appendChild(this.svgContainer);
    }

    private async loadSvg(): Promise<void> {
        try {
            const data = await d3.xml("assets/tank.svg");
            if (data?.documentElement) {
                this.svgContainer.innerHTML = "";
                this.svgContainer.appendChild(data.documentElement);
                this.initialized = true;
            }
        } catch (error) {
            console.error("Error loading SVG:", error);
        }
    }

    public async update(options: VisualUpdateOptions) {
        if (!this.initialized) {
            await this.loadSvg();
        }

        const dataView: DataView = options.dataViews?.[0];
        if (!dataView) return;

        // Get the actual level value (first value column)
        const actualLevelColumn = dataView.categorical?.values?.[0];
        const actualLevel = actualLevelColumn?.values?.[0] as number ?? 0;

        // Get max level if available (second value column)
        const maxLevelColumn = dataView.categorical?.values?.[1];
        const maxLevel = maxLevelColumn?.values?.[0] as number ?? 100;

        // Calculate fill ratio (0-1)
        const fillRatio = Math.min(Math.max(actualLevel / maxLevel, 0), 1);

        // Update the fill height of the tank
        const totalHeight = 300;
        const fillHeight = totalHeight * fillRatio;
        const y = 350 - fillHeight;

        const fillRect = d3.select(this.svgContainer).select("#fill");
        if (!fillRect.empty()) {
            fillRect
                .attr("y", y)
                .attr("height", fillHeight);
        }
    }
}