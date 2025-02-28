let DameDaneParticleDemo = new DameDaneParticle(
  document.getElementById('akCanvas'),
  {
    src: './images/particle.png', // 确保路径正确
    renderX: window.innerWidth / 2 - 200, // 调整位置居中
    renderY: window.innerHeight / 2 - 200,
    w: 400, // 调整图片大小
    size: 1.2, // 增加粒子大小
    spacing: 3, // 调整粒子间距
    validColor: {
      min: 100, // 降低最小阈值，让更多像素可见
      max: 765,
      invert: false,
    },
    effectParticleMode: 'adsorption', // 吸附模式
    Thickness: 15, // 调整吸附强度
    Drag: 0.95, // 调整拖拽效果
    Ease: 0.25, // 调整缓动效果
    cancelParticleAnimation: false, // 允许粒子动画
  }
)

function arknight() {
  DameDaneParticleDemo.ChangeImg('./image/arknight.png', { w: 600 })
}

function island() {
  DameDaneParticleDemo.ChangeImg('./image/island.png', { w: 400 })
}

function longmen() {
  DameDaneParticleDemo.ChangeImg('./image/longmen.png', { w: 450 })
}

function penguin() {
  DameDaneParticleDemo.ChangeImg('./image/penguin.png', { w: 300 })
}

function rhine() {
  DameDaneParticleDemo.ChangeImg('./image/rhine.png', { w: 400 })
}

function reunion() {
  DameDaneParticleDemo.ChangeImg('./image/reunion.jpg', { w: 300 })
}

// 添加一个切换颜色的函数
function changeColor(r, g, b) {
  DameDaneParticleDemo.ChangeImg('./images/particle.png', {
    validColor: {
      min: 100,
      max: 765,
      invert: false,
      color: { r, g, b },
    },
  })
}

// 示例：切换为蓝色
// changeColor(0, 0, 255);
