let sw = require("selenium-webdriver");
let cd = require("chromedriver");
let fs = require("fs");
let swd = new sw.Builder();
let browser = swd.forBrowser("chrome").build();

let cfile = process.argv[2];
let usertoAdd = process.argv[3];

(async function () {
  try {
    await browser.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 10000,
    });
    let content = await fs.promises.readFile(cfile);
    let obj = JSON.parse(content);
    let user = obj.un;
    let password = obj.pw;
    let url = obj.url;
    await browser.get(url);
    let username = await browser.findElement(sw.By.css("#input-1"));
    let pass = await browser.findElement(sw.By.css("#input-2"));
    await username.sendKeys(user);
    await pass.sendKeys(password);

    let btnlogin = await browser.findElement(sw.By.css(".auth-button"));
    await btnlogin.click();

    let btncontest = await browser.findElement(
      sw.By.css("a[data-analytics=NavBarProfileDropDownAdministration]")
    );
    let adminurl = await btncontest.getAttribute("href");
    await browser.get(adminurl);

    let managetag = await browser.findElements(sw.By.css("ul.nav-tabs li"));
    await managetag[1].click();

    let curl = browser.getCurrentUrl();
    let qidx = 0;
    let questionele = await getQuestionElement(curl, qidx);
    while (questionele != undefined) {
      await handleQuestion(questionele);
      qidx++;
      questionele = await getQuestionElement(curl, qidx);
    }
  } catch (err) {
    console.log(err);
  }
})();

async function getQuestionElement(curl, qidx) {
  await browser.get(curl);
  let pidx = parseInt(qidx / 10);
  qidx = qidx % 10;

  let pagingnationbtns = await browser.findElements(
    sw.By.css(".pagination li")
  );
  let nextpagebtns = await pagingnationbtns[pagingnationbtns.length - 2];
  let classonNextpagebtn = await nextpagebtns.getAttribute("class");

  for (let i = 0; i < pidx; i++) {
    if (classonNextpagebtn !== "disabled") {
      await nextpagebtns.click();

      pagingnationbtns = await browser.findElements(
        sw.By.css(".pagination li")
      );
      nextpagebtns = pagingnationbtns[pagingnationbtns.length - 2];
      classonNextpagebtn = await nextpagebtns.getAttribute("class");
    } else {
      return undefined;
    }
  }

  let questionElements = await browser.findElements(
    sw.By.css(".backbone.block-center")
  );
  console.log(questionElements.length + " " + qidx);
  if (qidx < questionElements.length) {
    let qurl = questionElements[qidx];
    return qurl;
  } else {
    return undefined;
  }
}

async function handleQuestion(questionelement) {
  await questionelement.click();

  // sleepSync(2000);  // Solution 1

  // Solution 2

  //   let nametext = await browser.findElement(sw.By.css("#name"));
  //   await nametext.sendKeys("kuchbhi");
  //   try {
  //     let dicardbtn = await browser.wait(
  //       sw.until.elementLocated(sw.By.css("#cancelBtn")),
  //       500
  //     );
  //     await dicardbtn.click();
  //   } catch (err) {}

  // Solution 3
  waitUntilLoaderDisappers(".tag");

  let moderatortab = await browser.findElement(
    sw.By.css("li[data-tab=moderators]")
  );
  await moderatortab.click();

  let moderatortextbox = await browser.findElement(sw.By.css("#moderator"));
  await moderatortextbox.sendKeys(usertoAdd);
  await moderatortextbox.sendKeys(sw.Key.ENTER);

  let btnsave = await browser.findElement(sw.By.css(".save-challenge"));
  await btnsave.click();
}

async function waitUntilLoaderDisappers(check) {
  let loader = await browser.findElement(sw.By.css(check));
  await browser.wait(sw.until.elementIsNotVisible(loader));
}

function sleepSync(duration) {
  let curr = Date.now();
  let limit = curr + duration;
  while (curr < limit) {
    curr = Date.now();
  }
}
