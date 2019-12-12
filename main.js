// ==UserScript==
// @name        github outline - github.com
// @namespace   Violentmonkey Scripts
// @match       https://github.com/*
// @grant       none
// @version     1.02
// @author      TianyiLi-e0991100238@gmail.com
// @description Get Readme file outline at github
// @description:zh-TW Github outline 懸浮視窗
// ==/UserScript==
if (document.querySelector('#readme article')) {
  const canvas = document.createElement('div')
  canvas.style = `
    position: fixed;
    top: 10vh;
    right: 8vw;
    width: 300px;
    border-radius: 5px;
    background: white;
    border: solid 1px #e0e0e0;
    overflow-y: auto;
    max-height: 60vh;
`
  const markdownDOM = document.querySelector('#readme article')
  function recursiveNodeReader(node) {
    let nodes = [...node.querySelectorAll('h1, h2, h3, h4, h5')]
    let n = nodes.shift()
    let result = []
    do {
      if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(n.tagName.toLowerCase())) {
        result.push({
          text: n.textContent,
          level:
            ['h1', 'h2', 'h3', 'h4', 'h5'].indexOf(n.tagName.toLowerCase()) + 1,
          link: n.querySelector('a').href,
        })
      }
    } while ((n = nodes.shift()))
    return result
  }

  function renderDOM(domTree) {
    return domTree
      .map(
        node =>
          `<a style="display:block" href="${node.link}" level="${node.level}">${
            node.level > 1 ? '&nbsp;'.repeat(node.level - 2) + '└' : '─'
          }${node.text}</a>`
      )
      .join('')
  }
  const body = document.createElement('div')
  const header = document.createElement('div')
  header.textContent = 'Outline'
  header.style = `
    padding: .5rem .7rem;
    font-size: 2rem;
    position: sticky;
    top: 0px;
    background: white;
  `

  body.style = `
    padding: .2rem .3rem;
  `

  body.addEventListener('mousedown', e => e.stopPropagation(), {
    capture: true,
  })
  body.addEventListener('click', e => e.stopPropagation(), { capture: true })
  let isMove = false
  let position = {
    x: 0,
    y: 0,
  }
  let target = null
  function eleMove(e) {
    if (!isMove) return
    target.style.top = e.clientY - position.y + 'px'
    target.style.left = e.clientX - position.x + 'px'
    target.style.right = ''
  }
  canvas.addEventListener(
    'mousedown',
    function(e) {
      isMove = true
      position.x = e.offsetX
      position.y = e.offsetY
      target = this
      window.addEventListener('mousemove', eleMove, true)
    }
  )
  canvas.addEventListener(
    'mouseup',
    () => {
      isMove = false
      window.removeEventListener('mousemove', eleMove, true)
    }
  )

  body.innerHTML = renderDOM(recursiveNodeReader(markdownDOM))
  canvas.appendChild(header)
  canvas.appendChild(body)

  document.body.appendChild(canvas)
}