;(() => {
  const PARSE_LESSON_BLOCK_START = /科目分類\t科目分野\t学則グループ\t学則科目\t教員名\t単位数\t評価\t年度\t開講時期/m
  const PARSE_LESSON_BLOCK_END = /\t総取得単位数\t/m

  function parseLessons (input: string) {
    const start = input.match(PARSE_LESSON_BLOCK_START)
    const end = input.match(PARSE_LESSON_BLOCK_END)
    if (!(start && start.index && end && end.index)) return alert('入力形式を確認してください。')
    
    const table = input.slice(start.index + start[0].length, end.index).split('\n').map(line =>
      line.split('\t').map(item => item.trim())
    )
    
    return table
      .map(row => [row[3] ? fixFormat(row[3]): '', !!(row[3] && row[6] !== '不可')] as [string, boolean])
      .filter(([name, isValid]) => isValid)
      .map(([name]) => name)
  }

  const apply = () => {
    const input = (document.getElementById('Source') as HTMLTextAreaElement).value
    if (!input) return alert('ページを更新して再度実行してください。')
    const lessons = parseLessons(input)
    
    const distText = `;(${dist.toString().replace('__LESSONS_STR__', JSON.stringify(JSON.stringify(lessons)))})()`
    ;(document.getElementById('Dist') as HTMLTextAreaElement).value = distText
  }

  const __LESSONS_STR__ = ''

  const dist = () => {
    const targets = Array.from(document.querySelectorAll('.inner>label'))
    const targetMapStr = targets.reduce((prev,curr, i) => prev + `;${i}:${curr.textContent.trim()};`, '')
    
    const lessons = JSON.parse(__LESSONS_STR__)
    const failed = lessons
      .map(lesson => [lesson, new RegExp(`;([0-9]*):${lesson}.*?;`)] as [string, RegExp])
      .filter(([lesson, pattern]) => {
        
        const match = targetMapStr.match(pattern)
        if (!match) return true
        
        
        const index = parseInt(match[1])
        if (isNaN(index)) return true
        
        const target = targets[index]
        if (!target) return true
        
        const input = target.querySelector<HTMLInputElement>(':scope>input')
        if (!input) return true
        
        if (!input.checked) input.click()
        return false
      })
      .map(([lesson]) => lesson)
      
    if (failed.length) {
      alert('自動チェックに失敗した講義があります。');
      console.log(failed.join('\n'));
      
    }
  }


  const fixFormat = (lesson: string): string =>
    lesson
      .replace(/([a-zⅠⅡⅢⅣ])(?=[A-Z])/g, '$1 ')
      .replace(/-.*$/, '')
      
      
  document.getElementById('submit').onclick = apply
})()
