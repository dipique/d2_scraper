const puppeteer = require('puppeteer')
const fs = require('fs')

const BASE_URL = 'http://classic.battle.net/diablo2exp/items'
const getItemUrl = (item, quality) => `${BASE_URL}/${quality}/${item}.shtml`

console.log('Loading config.json...')
const { qualities, itemTypes } = JSON.parse(fs.readFileSync('config.json'))

;(async () => {
    const browser = await puppeteer.launch()
    const items = []
    try {
        for (let [id, name] of Object.entries(itemTypes)) {
            const itemType = {
                id,
                name,
                itemGroups: {}
            }
            for (let quality of qualities)
                itemType.itemGroups[quality] = (await process(browser, getItemUrl(id, quality))) || ['Load failed']
            items.push(itemType)
            console.log(itemType)
        }
    } catch(err) {
        console.error(err)
    } finally {
        await browser.close()
    }

    // save items
    fs.writeFileSync('items.json', JSON.stringify(items))
    console.log('Results written to items.json')
})()

const process = async (browser, url) => {
    console.log(`Loading items from ${url}...`)
    const page = await browser.newPage()
    try {
        await page.goto(url)
        const title = await page.evaluate(() => document.getElementsByTagName('center')[1].innerText)
        console.log(`\tFound title: ${title}`)
        const items = await page.evaluate(() => Array.from(document.querySelectorAll('center > table > tbody > tr > td:first-child')).map(el => el.innerText?.trim() || ''))
        console.log(`\tFound ${items?.length || 0} items`)
        return items
    } catch (err) {
        console.log(`failed to load items from url: ${url}`, err)
    } finally {
        await page.close()
    }
}