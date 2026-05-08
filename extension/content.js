const FLOWSTATE_URL = 'http://localhost:3000'

const slug = window.location.pathname.split('/problems/')[1]?.split('/')[0]
if (!slug) throw new Error('no slug')

const btn = document.createElement('button')
btn.id = 'flowstate-nudge'
btn.innerHTML = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:6px">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
  Open in FlowState
`
btn.style.cssText = `
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(79,70,229,0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: background 0.15s, transform 0.15s;
  display: flex;
  align-items: center;
`

btn.addEventListener('mouseenter', () => {
  btn.style.background = '#4338ca'
  btn.style.transform = 'scale(1.03)'
})
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#4f46e5'
  btn.style.transform = 'scale(1)'
})
btn.addEventListener('click', () => {
  window.open(`${FLOWSTATE_URL}/dashboard?problem=${encodeURIComponent(slug)}`, '_blank')
})

document.body.appendChild(btn)
