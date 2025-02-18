"use client"

import { LotteryWheel } from "@/components/lottery-wheel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

const prizes = [
  { id: 1, name: "一等奖", color: "#FF6B6B", probability: 0.05 },
  { id: 2, name: "二等奖", color: "#4ECDC4", probability: 0.1 },
  { id: 3, name: "三等奖", color: "#45B7D1", probability: 0.15 },
  { id: 4, name: "四等奖", color: "#96CEB4", probability: 0.2 },
  { id: 5, name: "五等奖", color: "#FFEEAD", probability: 0.2 },
  { id: 6, name: "谢谢参与", color: "#D4D4D4", probability: 0.3 },
]

export default function LotteryPage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const handleSpin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setWinner(null)

    // 随机选择一个奖项，考虑概率
    const random = Math.random()
    let cumulativeProbability = 0
    let selectedPrize = prizes[prizes.length - 1]

    for (const prize of prizes) {
      cumulativeProbability += prize.probability
      if (random <= cumulativeProbability) {
        selectedPrize = prize
        break
      }
    }

    // 3秒后停止旋转
    setTimeout(() => {
      setIsSpinning(false)
      setWinner(selectedPrize.name)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-white/80 backdrop-blur shadow-xl rounded-2xl">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            幸运大转盘
          </h1>
          
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-600">
                ⬇ 点击下方按钮开始
              </div>
              <LotteryWheel
                prizes={prizes}
                isSpinning={isSpinning}
                selectedPrizeIndex={winner ? prizes.findIndex(p => p.name === winner) : -1}
              />
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <Button
                size="lg"
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                {isSpinning ? "抽奖中..." : "开始抽奖"}
              </Button>

              {winner && (
                <div className="text-xl font-semibold text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 shadow-sm animate-fade-in">
                  🎉 恭喜您获得了 <span className="text-yellow-600">{winner}</span>！
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mt-4">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ backgroundColor: `${prize.color}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: prize.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {prize.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {(prize.probability * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
