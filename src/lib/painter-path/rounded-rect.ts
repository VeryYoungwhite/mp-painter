import { PainterBasePath, PainterPathBaseOption,  } from "./base";
import { BorderRadius } from "../value";
import PainterElement from "../painter-element/paint-element";

export interface PainterRoundedRectanglePathOption extends PainterPathBaseOption {
    type: "rounded-rect",
    width: number,
    height: number,
    borderRadius: BorderRadius
}

export class PainterRoundedRectanglePath extends PainterBasePath {
    option: PainterRoundedRectanglePathOption;

    constructor (element: PainterElement, option: PainterRoundedRectanglePathOption){
        super(element);
        this.option = option;

        if(this.option.borderRadius){
            this.assertBorderRadius();
        }
    }

    private assertBorderRadius(){
        if(this.normalizedBorderRadius.some(radius => radius < 0)){
            console.warn("border radius must greater than 0, got:", this.normalizedBorderRadius.join(","));
            this.option.borderRadius = 0;
        }
    }

    paint(){
        this.reduceBorderRadius();

        let [leftTopRadius, rightTopRadius, rightBottomRaidus, leftBottomRadius] = this.normalizedBorderRadius;
        let { ctx, upx2px } = this.painter;
    
        ctx.beginPath();
    
        ctx.moveTo(
          upx2px(this.elementX),
          upx2px(this.elementY + leftTopRadius)
        );
    
        // left top
        ctx.arcTo(
          upx2px(this.elementX),
          upx2px(this.elementY),
          upx2px(this.elementX + leftTopRadius),
          upx2px(this.elementY),
          upx2px(leftTopRadius)
        );
    
        // right top
        ctx.arcTo(
          upx2px(this.elementX + this.option.width),
          upx2px(this.elementY),
          upx2px(this.elementX + this.option.width),
          upx2px(this.elementY + rightTopRadius),
          upx2px(rightTopRadius)
        );
    
        // right bottom
        ctx.arcTo(
          upx2px(this.elementX + this.option.width),
          upx2px(this.elementY + this.option.height),
          upx2px(this.elementX + this.option.width - rightBottomRaidus),
          upx2px(this.elementY + this.option.height),
          upx2px(rightBottomRaidus)
        );
    
        // left bottom
        ctx.arcTo(
          upx2px(this.elementX),
          upx2px(this.elementY + this.option.height),
          upx2px(this.elementX),
          upx2px(this.elementY + this.option.height - leftBottomRadius),
          upx2px(leftBottomRadius)
        )
        
        ctx.closePath();
    }

    private get normalizedBorderRadius(): [number, number, number, number]{
        if(typeof this.option.borderRadius == "number"){
          return Array.from({ length: 4 }).fill(this.option.borderRadius) as [number, number, number, number];
        } else {
          return [...this.option.borderRadius] as [number, number, number, number];
        }
    }

    /**
     * @see https://www.w3.org/TR/css-backgrounds-3/#corner-overlap
     * Corner curves must not overlap: When the sum of any two adjacent border
     * radii exceeds the size of the border box, UAs must proportionally reduce
     * the used values of all border radii until none of them overlap.
     */
    private reduceBorderRadius(){
        let [leftTopRadius, rightTopRadius, rightBottomRaidus, leftBottomRadius] = this.normalizedBorderRadius;
        let f = Math.min(
        // top
        this.option.width / (leftTopRadius + rightTopRadius),
        // right
        this.option.height / (rightTopRadius + rightBottomRaidus),
        // bottom
        this.option.width / (leftBottomRadius + rightBottomRaidus),
        // left
        this.option.height / (leftTopRadius + leftBottomRadius)
        );

        if(f >= 1) return;

        this.option.borderRadius = this.normalizedBorderRadius.map(radius => radius * f) as [number, number, number, number];
    }
}
