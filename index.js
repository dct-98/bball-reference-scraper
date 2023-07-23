import puppeteer from "puppeteer";

const getStats = async (playerName, season) => {

    const [firstName, lastName] = playerName.split(' ');
    const playerUrl = `https://www.basketball-reference.com/players/${lastName[0].toLowerCase()}/${lastName.toLowerCase()}${firstName.toLowerCase().substr(0,2)}01.html`;

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto(playerUrl, {
        waitUntil: "domcontentloaded",
    });

    const data = await page.evaluate((season) => {
        const ths = Array.from(document.querySelectorAll('table#per_game thead tr th')); 
        const header = ths.map(th => th.innerText);
        const rows = Array.from(document.querySelectorAll('table#per_game tbody tr:not(.thead)'));

        const stats = rows.map(row => {
            const tds = Array.from(row.querySelectorAll('td, th')).slice(0, header.length); // include 'th' to fetch the season
            let obj = {};
            tds.forEach((td, i) => {
                obj[header[i]] = td.innerText;
            });
            return obj;
        });

        // Find the season
        return stats.find(stat => stat.Season === season);

    }, season);

    await browser.close();

    if (!data) {
        throw new Error(`Could not find stats for ${playerName} for ${season}`);
    }

    return data;

}

getStats('Nikola Jokic', '2022-23')
    .then(console.log)
    .catch(console.error);
