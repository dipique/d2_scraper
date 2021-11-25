const fs = require('fs')

const items = JSON.parse(fs.readFileSync('items.json'))

const getItemHtml = item => {
    const qualities = Object.keys(item.itemGroups)
    const colCount = qualities.length
    let working = `<tr><td colspan="${colCount}">${item.name}</td></tr>`
    working += `<tr>${qualities.map(q => `<td class="quality">${q}</td>`).join('')}</tr>`

    let rowNum = 0
    let vals = []
    do {
        if (vals.length)
            working += `<tr>${vals.map(v => `<td>${v}</td>`).join('')}</tr>`
        vals = qualities
            .map(q => item.itemGroups[q]
                        .slice(rowNum, rowNum + 1)
            .find(s => s) || '')
        rowNum++
    } while (vals.some(v => v))

    return `<table>${working}</table>`
}

const style = `<style>
    td {
        text-align: center;
        border: 1px solid darkgray;
    }

    td.quality {
        font-style: italic;
    }

    tr:first-child > td {
        font-weight: bold;
    }

    table {
        
        border: 2px solid #898989;
    }
</style>`

const html = `<html><body>${style}${items.map(getItemHtml).join('<br />')}</body></html>`

fs.writeFileSync('output.html', html)