"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface Prize {
  id: number
  name: string
  color: string
  probability: number
}

interface LotteryWheelProps {
  prizes: Prize[]
  isSpinning: boolean
  selectedPrizeIndex: number
}

export function LotteryWheel({
  prizes,
  isSpinning,
  selectedPrizeIndex,
}: LotteryWheelProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isSpinning) {
      // 开始旋转时，增加8圈
      setRotation(prev => prev + 2880)
    } else if (selectedPrizeIndex !== -1) {
      // 停止时，计算到选中奖项的角度
      const segmentAngle = 360 / prizes.length
      const targetRotation =
        rotation -
        (rotation % 360) +
        360 -
        (segmentAngle * selectedPrizeIndex + segmentAngle / 2)
      setRotation(targetRotation)
    }
  }, [isSpinning, selectedPrizeIndex, prizes.length, rotation])

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  return (
    <div className="relative w-80 h-80">
      {/* 外圈装饰 */}
      <div className="absolute inset-0 rounded-full border-8 border-gray-200/50 backdrop-blur" />
      
      {/* 指针 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 z-20">
        <div className="w-full h-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
                        border-l-[15px] border-l-transparent 
                        border-r-[15px] border-r-transparent 
                        border-t-[30px] border-red-500
                        filter drop-shadow-lg" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 
                        bg-white rounded-full border-2 border-red-500 
                        transform -translate-y-1" />
        </div>
      </div>
      
      {/* 转盘 */}
      <div
        className={cn(
          "w-full h-full rounded-full relative transition-all shadow-2xl overflow-hidden",
          "transform-gpu perspective-1000",
          isSpinning ? "duration-[3000ms] ease-in-out" : "duration-1000 ease-out"
        )}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <svg
          viewBox="-1 -1 2 2"
          style={{ transform: "rotate(-90deg)" }}
          className="w-full h-full"
        >
          {prizes.map((prize, i) => {
            const startPercent = i / prizes.length
            const endPercent = (i + 1) / prizes.length
            
            const [startX, startY] = getCoordinatesForPercent(startPercent)
            const [endX, endY] = getCoordinatesForPercent(endPercent)
            
            const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0
            
            const pathData = [
              `M ${startX} ${startY}`, // 移动到起始点
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // 画弧
              `L 0 0`, // 连接到中心点
            ].join(" ")
            
            return (
              <g key={prize.id} className="hover:opacity-90 transition-opacity">
                <path
                  d={pathData}
                  fill={prize.color}
                  stroke="white"
                  strokeWidth="0.01"
                />
                <text
                  fill="white"
                  fontSize="0.15"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`
                    rotate(${(startPercent + endPercent) * 180})
                    translate(0.65)
                    rotate(90)
                  `}
                  style={{
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))"
                  }}
                >
                  {prize.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* 中心点 */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 
                      bg-white rounded-full shadow-lg
                      transform -translate-x-1/2 -translate-y-1/2
                      border-4 border-gray-200/50 z-10" />
      </div>
    </div>
  )
}
