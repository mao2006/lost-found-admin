export function buildMockPhoto(title: string, colorStart = '#3b82f6', colorEnd = '#1d4ed8') {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colorStart}" />
        <stop offset="100%" stop-color="${colorEnd}" />
      </linearGradient>
    </defs>
    <rect width="600" height="420" fill="url(#g)" rx="24" ry="24" />
    <rect x="52" y="44" width="496" height="332" fill="rgba(255,255,255,0.18)" rx="18" ry="18" />
    <text x="300" y="225" fill="#fff" font-size="42" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${title}</text>
  </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function createDateByDaysAgo(daysAgo: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function formatDate(value: string) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return formatter.format(new Date(value)).replace(/\//g, '/')
}

export function formatDateTime(value: string) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric',
  })

  return formatter.format(new Date(value)).replace(/\//g, '-')
}
