const questions = [ // 建立六道對應指定主題的 p5.js 題目
  { topic: `畫布建立`, text: `哪一行可以建立寬高都是 400 的畫布？`, answer: 0 }, // 設定第一題主題、題目與正確選項
  { topic: `背景設定`, text: `哪一行可以把畫布背景設定成淺灰色？`, answer: 1 }, // 設定第二題主題、題目與正確選項
  { topic: `繪圖循環`, text: `哪一段程式會在 p5.js 中每一幀重複執行？`, answer: 2 }, // 設定第三題主題、題目與正確選項
  { topic: `滑鼠互動`, text: `哪一段程式可以在滑鼠按下時畫出圓形？`, answer: 3 }, // 設定第四題主題、題目與正確選項
  { topic: `變數宣告`, text: `哪一行可以宣告一個初始值為 0 的分數變數？`, answer: 4 }, // 設定第五題主題、題目與正確選項
  { topic: `條件判斷`, text: `哪一段程式可以判斷分數是否達到 60 分？`, answer: 5 } // 設定第六題主題、題目與正確選項
]; // 完成題目資料陣列
const options = [ // 建立六個可拖曳的程式選項
  `createCanvas(400, 400);`, // 建立畫布選項
  `background(220);`, // 建立背景設定選項
  `function draw() { ... }`, // 建立繪圖循環選項
  `function mousePressed() { ellipse(mouseX, mouseY, 40); }`, // 建立滑鼠互動選項
  `let score = 0;`, // 建立變數宣告選項
  `if (score >= 60) { ... }` // 建立條件判斷選項
]; // 完成選項資料陣列
const imageUrls = [ // 建立六張不同主題的 Unsplash 公開圖片網址
  `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80`, // 設定畫布建立主題圖片網址
  `https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=80`, // 設定背景設定主題圖片網址
  `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80`, // 設定繪圖循環主題圖片網址
  `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80`, // 設定滑鼠互動主題圖片網址
  `https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80`, // 設定變數宣告主題圖片網址
  `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80` // 設定條件判斷主題圖片網址
]; // 完成圖片網址陣列
let questionImages = []; // 儲存六張題目圖片物件
let imageReady = []; // 儲存六張圖片是否成功載入
let imageFailed = []; // 儲存六張圖片是否載入失敗
let answers = []; // 儲存六個作答區目前放入的選項編號
let dragging = null; // 儲存目前被拖曳的選項資料
let pointerX = 0; // 儲存拖曳指標的水平座標
let pointerY = 0; // 儲存拖曳指標的垂直座標
let submitted = false; // 記錄是否已經交卷
let correctCount = 0; // 儲存交卷後的答對題數
let score = 0; // 儲存交卷後的百分比成績
let passed = false; // 記錄是否達到百分之六十
let ribbons = []; // 儲存達標時的彩帶粒子
let layout = {}; // 儲存所有響應式版面資料
function preload() { // 在程式啟動前載入六張題目圖片
  for (let i = 0; i < imageUrls.length; i += 1) { // 逐一載入每一題的圖片
    imageReady[i] = false; // 將目前圖片初始設定為尚未完成
    imageFailed[i] = false; // 將目前圖片初始設定為尚未失敗
    questionImages[i] = loadImage(imageUrls[i], () => { imageReady[i] = true; }, () => { imageFailed[i] = true; }); // 設定圖片成功與失敗的回呼處理
  } // 結束六張圖片載入迴圈
} // 結束圖片預載入函式
function setup() { // 初始化全螢幕畫布與測驗狀態
  createCanvas(windowWidth, windowHeight); // 建立符合視窗大小的響應式畫布
  textFont(`sans-serif`); // 設定瀏覽器通用字型
  textAlign(LEFT, TOP); // 設定文字預設為左上對齊
  rectMode(CORNER); // 設定矩形使用左上角座標模式
  answers = Array(questions.length).fill(null); // 讓六個作答區一開始都是空白
  updateLayout(); // 依照目前視窗大小計算版面位置
} // 結束初始化函式
function draw() { // 每一幀繪製完整測驗介面
  background(13, 18, 45); // 清除畫布並設定深色藍紫背景
  updateLayout(); // 持續更新版面以支援響應式尺寸
  drawBackgroundGlow(); // 繪製現代卡片風格的背景光暈
  drawHeader(); // 繪製上方標題區與作答進度
  drawAnswerZones(); // 繪製六個含圖片的作答卡片
  drawOptions(); // 繪製下方的六個文字選項卡片
  drawBottom(); // 繪製交卷按鈕或交卷後的結果卡片
  if (dragging) { drawDragging(); } // 拖曳時繪製跟隨指標的預覽卡片
  if (submitted && passed) { updateRibbons(); drawRibbons(); } // 達標交卷後播放彩帶動畫
} // 結束每幀繪圖函式
function updateLayout() { // 根據畫布大小計算所有卡片位置
  const margin = constrain(width * 0.035, 12, 32); // 計算畫面左右邊界留白
  const columns = width >= 850 ? 3 : 2; // 大畫面使用三欄，小畫面使用兩欄
  const gap = constrain(width * 0.014, 7, 14); // 計算卡片之間的間距
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns; // 計算每張卡片的寬度
  const headerH = width < 560 ? 76 : 88; // 依照螢幕寬度設定標題區高度
  const rows = ceil(questions.length / columns); // 計算作答卡片列數
  const optionRows = ceil(options.length / columns); // 計算文字選項列數
  const sectionH = 22; // 設定小節標題預留高度
  const bottomH = submitted ? 50 : 40; // 設定底部結果或交卷按鈕高度
  const fixedH = headerH + 4 + sectionH + 10 + sectionH + 10 + bottomH + 8 + gap * (rows + optionRows - 2); // 計算不包含卡片的固定高度
  const availableH = max(1, height - fixedH); // 計算作答卡片與選項卡片可使用的總高度
  const unitH = availableH / (rows * 1.22 + optionRows); // 依照作答卡片較高的比例計算基準高度
  const compactMobile = width < 560; // 判斷目前是否為需要緊湊排版的手機寬度
  const answerH = compactMobile ? constrain((height - 205) / 6.1, 62, 86) : max(54, min(unitH * 1.22, 190)); // 依照裝置設定含圖片作答卡片高度
  const optionH = compactMobile ? constrain((height - 205) / 10.2, 44, 62) : max(42, min(unitH, 112)); // 依照裝置設定文字選項卡片高度
  const answerTitleY = headerH + 4; // 計算作答區標題位置
  const answerY = answerTitleY + sectionH; // 計算作答卡片起始位置
  const answerEndY = answerY + rows * answerH + (rows - 1) * gap; // 計算作答卡片區域底端位置
  const optionTitleY = answerEndY + 10; // 計算文字選項標題位置
  const optionY = optionTitleY + sectionH; // 計算文字選項卡片起始位置
  const optionEndY = optionY + optionRows * optionH + (optionRows - 1) * gap; // 計算文字選項區域底端位置
  const bottomY = optionEndY + 10; // 計算底部按鈕或結果卡片位置
  const answerBoxes = []; // 建立作答卡片位置陣列
  const optionBoxes = []; // 建立文字選項位置陣列
  for (let i = 0; i < questions.length; i += 1) { // 逐一計算六個作答卡片位置
    const col = i % columns; // 計算目前卡片所在欄位
    const row = floor(i / columns); // 計算目前卡片所在列數
    answerBoxes.push({ x: margin + col * (cardWidth + gap), y: answerY + row * (answerH + gap), w: cardWidth, h: answerH }); // 保存作答卡片矩形資料
  } // 結束作答卡片位置計算
  for (let i = 0; i < options.length; i += 1) { // 逐一計算六個文字選項位置
    const col = i % columns; // 計算目前選項所在欄位
    const row = floor(i / columns); // 計算目前選項所在列數
    optionBoxes.push({ x: margin + col * (cardWidth + gap), y: optionY + row * (optionH + gap), w: cardWidth, h: optionH }); // 保存文字選項矩形資料
  } // 結束文字選項位置計算
  const submitBox = { x: margin, y: bottomY, w: min(190, width * 0.48), h: bottomH }; // 建立交卷按鈕位置資料
  const resultBox = { x: margin, y: bottomY, w: width - margin * 2, h: bottomH }; // 建立交卷後結果卡片位置資料
  const restartBox = { x: width - margin - min(116, width * 0.3), y: bottomY + 5, w: min(116, width * 0.3), h: bottomH - 10 }; // 建立重新開始按鈕位置資料
  layout = { margin, headerH, columns, gap, answerTitleY, answerBoxes, optionTitleY, optionBoxes, bottomY, answerH, optionH, submitBox, resultBox, restartBox }; // 保存完整響應式版面資料
} // 結束版面計算函式
function drawBackgroundGlow() { // 繪製背景中的柔和藍紫光暈
  noStroke(); // 移除光暈外框
  fill(55, 43, 116, 80); // 設定左上光暈顏色與透明度
  ellipse(width * 0.08, height * 0.08, width * 0.5, width * 0.5); // 繪製左上圓形光暈
  fill(26, 91, 125, 55); // 設定右下光暈顏色與透明度
  ellipse(width * 0.94, height * 0.86, width * 0.6, width * 0.6); // 繪製右下圓形光暈
} // 結束背景光暈繪製函式
function drawHeader() { // 繪製上方標題區與作答進度
  const margin = layout.margin; // 取得目前畫面邊界留白
  const done = answers.filter((answer) => answer !== null).length; // 計算目前已放入作答區的題數
  const progressW = min(205, max(132, width * 0.3)); // 計算進度卡片寬度
  const progressX = width - margin - progressW; // 計算進度卡片水平位置
  noStroke(); // 移除標題區外框
  fill(173, 151, 255); // 設定小標籤文字顏色
  textStyle(BOLD); // 設定小標籤使用粗體
  textSize(constrain(width * 0.012, 10, 13)); // 設定小標籤文字大小
  text(`CODE LAB  /  p5.js`, margin, 12); // 繪製測驗分類小標籤
  fill(248, 249, 255); // 設定主標題文字顏色
  textSize(constrain(width * 0.032, 20, 31)); // 設定主標題文字大小
  text(`程式設計挑戰`, margin, 27); // 繪製現代化測驗主標題
  textStyle(NORMAL); // 還原一般字體樣式
  fill(172, 181, 219); // 設定說明文字顏色
  textSize(constrain(width * 0.013, 10, 15)); // 設定說明文字大小
  text(submitted ? `測驗已提交，請查看你的挑戰結果。` : `拖曳程式片段，完成六道 p5.js 題目。`, margin, 57); // 繪製操作說明文字
  fill(25, 31, 67, 235); // 設定進度卡片底色
  rect(progressX, 15, progressW, 48, 14); // 繪製進度卡片
  fill(174, 158, 255); // 設定進度標籤顏色
  textStyle(BOLD); // 設定進度標籤使用粗體
  textSize(constrain(width * 0.011, 10, 13)); // 設定進度標籤文字大小
  text(`作答進度`, progressX + 14, 23); // 繪製進度標籤
  fill(247, 248, 255); // 設定進度數字顏色
  textSize(constrain(width * 0.017, 14, 19)); // 設定進度數字大小
  text(`${done} / ${questions.length}`, progressX + 14, 39); // 繪製目前作答進度
  textStyle(NORMAL); // 還原一般字體樣式
} // 結束標題區繪製函式
function drawSectionTitle(label, y, accent) { // 繪製兩個內容區共用的小節標題
  noStroke(); // 移除小節標題外框
  fill(accent[0], accent[1], accent[2]); // 設定小節標題強調色
  rect(layout.margin, y + 3, 4, 16, 2); // 繪製小節標題左側色條
  fill(242, 244, 255); // 設定小節標題文字顏色
  textStyle(BOLD); // 設定小節標題使用粗體
  textSize(constrain(width * 0.015, 12, 17)); // 設定小節標題文字大小
  text(label, layout.margin + 12, y); // 繪製小節標題文字
  textStyle(NORMAL); // 還原一般字體樣式
} // 結束小節標題繪製函式
function drawAnswerZones() { // 繪製六個含有主題圖片的作答卡片
  drawSectionTitle(`作答區  /  將程式片段放到對應題目`, layout.answerTitleY, [112, 206, 255]); // 繪製作答區標題
  for (let i = 0; i < questions.length; i += 1) { // 逐一繪製六個作答卡片
    const box = layout.answerBoxes[i]; // 取得目前作答卡片資料
    const selected = answers[i]; // 取得目前作答區放入的選項編號
    const beingDragged = dragging && dragging.origin === i; // 判斷目前作答區是否正在被拖曳
    const imageH = max(20, min(box.h * 0.34, 68)); // 依卡片高度計算題目圖片高度
    const imageBox = { x: box.x + 7, y: box.y + 7, w: box.w - 14, h: imageH }; // 建立題目圖片顯示區域
    fill(beingDragged ? 48 : 27, beingDragged ? 58 : 34, beingDragged ? 97 : 77, 245); // 設定作答卡片底色
    stroke(beingDragged ? 134 : 76, beingDragged ? 181 : 93, beingDragged ? 255 : 164, 220); // 設定作答卡片外框顏色
    strokeWeight(1.2); // 設定作答卡片外框粗細
    rect(box.x, box.y, box.w, box.h, 12); // 繪製作答卡片
    drawQuestionImage(i, imageBox); // 在題目文字上方繪製對應主題圖片或失敗提示
    noStroke(); // 移除卡片文字外框
    fill(137, 213, 255); // 設定題號文字顏色
    textStyle(BOLD); // 設定題號使用粗體
    textSize(constrain(width * 0.0105, 9, 13)); // 設定題號文字大小
    text(`Q${i + 1}  ${questions[i].topic}`, box.x + 9, box.y + imageH + 10); // 繪製題號與主題標籤
    textStyle(NORMAL); // 還原一般字體樣式
    fill(238, 241, 255); // 設定題目文字顏色
    textSize(constrain(width * 0.0108, 9, 13)); // 設定題目文字大小
    textWrap(WORD); // 讓題目文字依照卡片寬度自動換行
    text(questions[i].text, box.x + 9, box.y + imageH + 25, box.w - 18, max(16, box.h - imageH - 54)); // 繪製圖片下方的原本題目文字
    if (selected === null && !beingDragged) { // 判斷作答區是否仍然空白
      fill(139, 151, 198); // 設定空白提示文字顏色
      textSize(constrain(width * 0.0095, 8, 11)); // 設定空白提示文字大小
      text(`拖曳選項到這裡`, box.x + 9, box.y + box.h - 18); // 顯示空白作答提示
    } else if (selected !== null && !beingDragged) { // 判斷作答區是否已有選項
      fill(122, 232, 202); // 設定已放入程式文字顏色
      textSize(constrain(width * 0.0093, 8, 11)); // 設定已放入程式文字大小
      text(options[selected], box.x + 9, box.y + box.h - 31, box.w - 18, 17); // 顯示目前放入的程式選項
      if (submitted) { drawResult(i, box); } // 只有交卷後才顯示單題結果
    } // 結束作答卡片內容判斷
  } // 結束六個作答卡片繪製迴圈
} // 結束作答區繪製函式
function drawQuestionImage(index, box) { // 繪製單一題目圖片並處理載入狀態
  noStroke(); // 移除圖片區域外框
  fill(16, 22, 52, 240); // 設定圖片區域底色
  rect(box.x, box.y, box.w, box.h, 8); // 繪製圖片區域背景
  if (imageReady[index] && questionImages[index]) { // 判斷該題圖片是否成功載入
    drawImageCover(questionImages[index], box.x, box.y, box.w, box.h); // 將對應主題圖片裁切填入圖片區域
  } else if (imageFailed[index]) { // 判斷該題圖片是否載入失敗
    fill(238, 133, 158); // 設定圖片失敗提示顏色
    textAlign(CENTER, CENTER); // 將圖片失敗提示置中
    textSize(constrain(width * 0.0095, 8, 11)); // 設定圖片失敗提示文字大小
    text(`圖片載入失敗`, box.x + box.w / 2, box.y + box.h / 2); // 顯示簡潔的圖片載入失敗提示
    textAlign(LEFT, TOP); // 還原文字對齊方式
  } else { // 處理圖片尚在載入的狀態
    fill(177, 185, 222); // 設定圖片載入中文字顏色
    textAlign(CENTER, CENTER); // 將圖片載入文字置中
    textSize(constrain(width * 0.0095, 8, 11)); // 設定圖片載入文字大小
    text(`圖片載入中……`, box.x + box.w / 2, box.y + box.h / 2); // 顯示圖片載入中提示
    textAlign(LEFT, TOP); // 還原文字對齊方式
  } // 結束圖片載入狀態判斷
  noFill(); // 設定圖片外框不填色
  stroke(104, 122, 190, 180); // 設定圖片外框顏色
  strokeWeight(1); // 設定圖片外框粗細
  rect(box.x, box.y, box.w, box.h, 8); // 繪製圖片外框
} // 結束單一題目圖片繪製函式
function drawImageCover(source, x, y, w, h) { // 以裁切方式將圖片完整填滿指定區域
  const imageRatio = source.width / max(1, source.height); // 計算原始圖片比例
  const boxRatio = w / max(1, h); // 計算顯示區域比例
  let sx = 0; // 設定圖片裁切起始水平座標
  let sy = 0; // 設定圖片裁切起始垂直座標
  let sw = source.width; // 設定圖片裁切寬度
  let sh = source.height; // 設定圖片裁切高度
  if (imageRatio > boxRatio) { sw = source.height * boxRatio; sx = (source.width - sw) / 2; } // 依比例裁切過寬的圖片
  if (imageRatio < boxRatio) { sh = source.width / boxRatio; sy = (source.height - sh) / 2; } // 依比例裁切過高的圖片
  image(source, x, y, w, h, sx, sy, sw, sh); // 將裁切後的圖片繪製到指定區域
} // 結束圖片裁切繪製函式
function drawResult(index, box) { // 繪製交卷後的單題結果
  const right = answers[index] === questions[index].answer; // 比較目前答案與正確答案
  noStroke(); // 移除結果文字外框
  fill(right ? 116 : 255, right ? 231 : 149, right ? 198 : 177); // 依照正誤設定結果文字顏色
  textStyle(BOLD); // 設定結果文字使用粗體
  textSize(constrain(width * 0.0088, 8, 10)); // 設定結果文字大小
  text(right ? `✓ 正確` : `✕ 正確答案：${options[questions[index].answer]}`, box.x + 9, box.y + box.h - 16, box.w - 18, 13); // 交卷後顯示正確結果或正確答案
  textStyle(NORMAL); // 還原一般字體樣式
} // 結束單題結果繪製函式
function drawOptions() { // 繪製下方的六個可拖曳文字選項卡片
  drawSectionTitle(`程式選項  /  按住並拖曳`, layout.optionTitleY, [192, 146, 255]); // 繪製程式選項區標題
  for (let i = 0; i < options.length; i += 1) { // 逐一繪製六個文字選項卡片
    const box = layout.optionBoxes[i]; // 取得目前文字選項卡片資料
    const placedAt = answers.indexOf(i); // 查詢此選項目前是否已放入作答區
    const beingDragged = dragging && dragging.option === i; // 判斷目前選項是否正在被拖曳
    fill(beingDragged ? 58 : placedAt >= 0 ? 31 : 25, beingDragged ? 67 : placedAt >= 0 ? 59 : 32, beingDragged ? 115 : placedAt >= 0 ? 92 : 71, 245); // 依照選項狀態設定卡片底色
    stroke(beingDragged ? 160 : placedAt >= 0 ? 101 : 78, beingDragged ? 211 : placedAt >= 0 ? 178 : 103, beingDragged ? 255 : placedAt >= 0 ? 226 : 175, 225); // 依照選項狀態設定卡片外框
    strokeWeight(1.2); // 設定文字選項外框粗細
    rect(box.x, box.y, box.w, box.h, 12); // 繪製文字選項卡片
    noStroke(); // 移除文字選項文字外框
    fill(210, 183, 255); // 設定選項編號顏色
    textStyle(BOLD); // 設定選項編號使用粗體
    textSize(constrain(width * 0.0098, 8, 12)); // 設定選項編號大小
    text(`CODE ${i + 1}`, box.x + 9, box.y + 8); // 繪製選項編號標籤
    fill(249, 250, 255); // 設定程式文字顏色
    textStyle(NORMAL); // 還原一般字體樣式
    textSize(constrain(width * 0.0105, 9, 13)); // 設定程式文字大小
    text(options[i], box.x + 9, box.y + 27, box.w - 18, max(15, box.h - 45)); // 繪製程式選項文字
    fill(151, 163, 207); // 設定操作提示顏色
    textSize(constrain(width * 0.0087, 8, 10)); // 設定操作提示文字大小
    text(submitted ? `測驗已鎖定` : placedAt >= 0 ? `已放置，可重新拖曳` : `按住並拖曳`, box.x + 9, box.y + box.h - 16); // 顯示操作狀態但不提前顯示正誤
  } // 結束六個文字選項繪製迴圈
} // 結束文字選項繪製函式
function drawBottom() { // 繪製交卷按鈕或交卷後的成績結果
  if (!submitted) { // 判斷目前是否尚未交卷
    noStroke(); // 移除交卷按鈕外框
    fill(105, 76, 210); // 設定交卷按鈕底色
    rect(layout.submitBox.x, layout.submitBox.y, layout.submitBox.w, layout.submitBox.h, 12); // 繪製交卷按鈕
    fill(255); // 設定交卷按鈕文字顏色
    textAlign(CENTER, CENTER); // 將交卷按鈕文字置中
    textStyle(BOLD); // 設定交卷按鈕文字使用粗體
    textSize(constrain(width * 0.012, 10, 15)); // 設定交卷按鈕文字大小
    text(`交卷看成績`, layout.submitBox.x + layout.submitBox.w / 2, layout.submitBox.y + layout.submitBox.h / 2); // 繪製交卷按鈕文字
    textAlign(LEFT, TOP); // 還原文字對齊方式
    textStyle(NORMAL); // 還原一般字體樣式
    fill(153, 164, 207); // 設定交卷前提示文字顏色
    textSize(constrain(width * 0.0095, 8, 12)); // 設定交卷前提示文字大小
    text(`送出後才會顯示分數與正確答案`, layout.submitBox.x + layout.submitBox.w + 10, layout.submitBox.y + 13, width - layout.submitBox.x - layout.submitBox.w - 20, 30); // 明確提醒交卷前不顯示成績
  } else { // 處理交卷後的成績畫面
    noStroke(); // 移除結果卡片外框
    fill(25, 31, 67, 245); // 設定結果卡片底色
    rect(layout.resultBox.x, layout.resultBox.y, layout.resultBox.w, layout.resultBox.h, 12); // 繪製成績結果卡片
    fill(248, 249, 255); // 設定成績文字顏色
    textStyle(BOLD); // 設定成績文字使用粗體
    textSize(constrain(width * 0.0115, 10, 16)); // 設定成績文字大小
    text(`答對 ${correctCount} / ${questions.length} 題　${score}%`, layout.margin + 10, layout.bottomY + 8); // 顯示答對題數與百分比
    fill(passed ? 120 : 255, passed ? 232 : 173, passed ? 204 : 184); // 依照是否達標設定結果訊息顏色
    textStyle(NORMAL); // 還原一般字體樣式
    textSize(constrain(width * 0.0095, 8, 12)); // 設定結果訊息文字大小
    text(passed ? `太棒了！達標成功，彩帶正在慶祝你的成果！` : `再接再厲！整理觀念後再挑戰一次吧！`, layout.margin + 10, layout.bottomY + 27, max(50, layout.restartBox.x - layout.margin - 20), 18); // 交卷後顯示達標或鼓勵訊息
    noStroke(); // 移除重新開始按鈕外框
    fill(67, 75, 133); // 設定重新開始按鈕底色
    rect(layout.restartBox.x, layout.restartBox.y, layout.restartBox.w, layout.restartBox.h, 10); // 繪製重新開始按鈕
    fill(255); // 設定重新開始文字顏色
    textAlign(CENTER, CENTER); // 將重新開始文字置中
    textStyle(BOLD); // 設定重新開始文字使用粗體
    textSize(constrain(width * 0.0098, 9, 13)); // 設定重新開始文字大小
    text(`重新開始`, layout.restartBox.x + layout.restartBox.w / 2, layout.restartBox.y + layout.restartBox.h / 2); // 繪製重新開始按鈕文字
    textAlign(LEFT, TOP); // 還原文字對齊方式
    textStyle(NORMAL); // 還原一般字體樣式
  } // 結束底部區域狀態判斷
} // 結束底部區域繪製函式
function startDrag(x, y) { // 處理滑鼠或觸控開始拖曳
  if (submitted) { return false; } // 交卷後禁止修改答案
  pointerX = x; // 記錄指標水平位置
  pointerY = y; // 記錄指標垂直位置
  for (let i = 0; i < layout.optionBoxes.length; i += 1) { // 先檢查是否按到下方文字選項
    if (inside(x, y, layout.optionBoxes[i])) { // 判斷指標是否位於文字選項卡片內
      const origin = answers.indexOf(i); // 查詢此選項原本所在的作答區
      if (origin >= 0) { answers[origin] = null; } // 清除原作答區以支援答案替換
      dragging = { option: i, origin }; // 建立目前拖曳資料
      return false; // 阻止瀏覽器觸控預設行為
    } // 結束文字選項命中判斷
  } // 結束文字選項搜尋
  for (let i = 0; i < layout.answerBoxes.length; i += 1) { // 再檢查是否按到已放置答案
    if (answers[i] !== null && inside(x, y, layout.answerBoxes[i])) { // 判斷指標是否位於已有答案的作答卡片內
      const option = answers[i]; // 記錄目前放置的選項編號
      answers[i] = null; // 清空原本作答區
      dragging = { option, origin: i }; // 建立從作答區開始的拖曳資料
      return false; // 阻止瀏覽器觸控預設行為
    } // 結束作答卡片命中判斷
  } // 結束作答卡片搜尋
  return false; // 保持畫布事件控制
} // 結束開始拖曳函式
function moveDrag(x, y) { // 處理拖曳中的滑鼠或觸控移動
  if (dragging) { pointerX = x; pointerY = y; } // 只有拖曳中才更新預覽位置
  return false; // 阻止觸控頁面捲動
} // 結束拖曳移動函式
function endDrag(x, y) { // 處理拖曳放開與答案放置
  if (!dragging) { return false; } // 沒有拖曳時不執行放置
  pointerX = x; // 記錄放開時的水平位置
  pointerY = y; // 記錄放開時的垂直位置
  let target = -1; // 預設沒有命中作答卡片
  for (let i = 0; i < layout.answerBoxes.length; i += 1) { // 逐一尋找命中的作答卡片
    if (inside(x, y, layout.answerBoxes[i])) { target = i; break; } // 找到命中卡片後記錄題目編號
  } // 結束作答卡片搜尋
  if (target >= 0) { // 判斷是否放入有效作答卡片
    const replaced = answers[target]; // 取得目標卡片原本的選項
    for (let i = 0; i < answers.length; i += 1) { // 逐一清除可能重複的相同選項
      if (answers[i] === dragging.option) { answers[i] = null; } // 避免同一個選項重複出現
    } // 結束重複選項清除迴圈
    answers[target] = dragging.option; // 將選項放入新的作答卡片
    if (replaced !== null && dragging.origin >= 0 && replaced !== dragging.option) { answers[dragging.origin] = replaced; } // 將被替換的舊答案放回來源位置
  } else if (dragging.origin >= 0) { // 判斷是否放到無效位置
    answers[dragging.origin] = dragging.option; // 放置失敗時恢復原本答案
  } // 結束答案放置判斷
  dragging = null; // 清除拖曳狀態
  return false; // 阻止瀏覽器預設行為
} // 結束拖曳放置函式
function drawDragging() { // 繪製跟隨指標移動的選項預覽
  const w = min(300, max(170, width * 0.38)); // 計算拖曳預覽卡片寬度
  const h = max(48, layout.optionH * 0.82); // 計算拖曳預覽卡片高度
  const x = constrain(pointerX - w / 2, 6, width - w - 6); // 計算拖曳預覽水平位置
  const y = constrain(pointerY - h / 2, 6, height - h - 6); // 計算拖曳預覽垂直位置
  push(); // 保存目前繪圖狀態
  fill(95, 72, 202, 238); // 設定拖曳預覽卡片底色
  stroke(220, 210, 255); // 設定拖曳預覽卡片外框顏色
  strokeWeight(2); // 設定拖曳預覽卡片外框粗細
  rect(x, y, w, h, 12); // 繪製拖曳預覽卡片
  noStroke(); // 移除預覽文字外框
  fill(255); // 設定預覽文字顏色
  textStyle(BOLD); // 設定預覽文字使用粗體
  textSize(constrain(width * 0.011, 9, 14)); // 設定預覽文字大小
  text(options[dragging.option], x + 12, y + 12, w - 24, h - 24); // 繪製正在拖曳的程式選項
  textStyle(NORMAL); // 還原一般字體樣式
  pop(); // 還原繪圖狀態
} // 結束拖曳預覽繪製函式
function inside(x, y, box) { // 判斷指標是否位於指定矩形範圍內
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h; // 回傳指標是否命中矩形
} // 結束矩形命中判斷函式
function submitQuiz() { // 計算成績並鎖定測驗
  if (submitted) { return; } // 避免重複交卷
  correctCount = 0; // 交卷時先清除答對題數
  for (let i = 0; i < questions.length; i += 1) { // 逐題比對目前答案
    if (answers[i] === questions[i].answer) { correctCount += 1; } // 找到正確答案時增加答對題數
  } // 結束逐題比對迴圈
  score = round(correctCount / questions.length * 100); // 計算整體百分比成績
  passed = score >= 60; // 依照需求設定百分之六十以上即達標
  submitted = true; // 交卷後才允許顯示分數與正確答案
  if (passed) { makeRibbons(); } // 達標時建立彩帶動畫粒子
} // 結束交卷函式
function restartQuiz() { // 重新開始一次全新的測驗
  answers = Array(questions.length).fill(null); // 清除六個作答區的答案
  dragging = null; // 清除目前拖曳狀態
  submitted = false; // 回到尚未交卷狀態
  correctCount = 0; // 清除答對題數
  score = 0; // 清除百分比成績
  passed = false; // 清除達標狀態
  ribbons = []; // 清除彩帶粒子
} // 結束重新開始函式
function makeRibbons() { // 建立達標時的彩帶粒子
  const colors = [[239, 92, 161], [246, 187, 82], [83, 207, 188], [119, 153, 255], [225, 125, 235]]; // 定義彩帶顏色陣列
  ribbons = []; // 清除舊的彩帶資料
  for (let i = 0; i < 90; i += 1) { // 建立九十個彩帶粒子
    const color = random(colors); // 隨機選取彩帶顏色
    ribbons.push({ x: random(width), y: random(-height, 0), vx: random(-1.4, 1.4), vy: random(1.5, 4.5), size: random(5, 11), angle: random(TWO_PI), spin: random(-0.12, 0.12), color }); // 儲存彩帶初始狀態
  } // 結束彩帶建立迴圈
} // 結束彩帶建立函式
function updateRibbons() { // 更新彩帶粒子的動畫位置
  for (const ribbon of ribbons) { // 逐一更新每個彩帶粒子
    ribbon.x += ribbon.vx; // 更新彩帶水平位置
    ribbon.y += ribbon.vy; // 更新彩帶垂直位置
    ribbon.vy += 0.035; // 加入重力效果
    ribbon.angle += ribbon.spin; // 更新彩帶旋轉角度
    if (ribbon.y > height + 20) { ribbon.y = random(-80, -10); ribbon.x = random(width); ribbon.vy = random(1.5, 4.5); } // 超出畫面後從上方重新出現
  } // 結束彩帶更新迴圈
} // 結束彩帶更新函式
function drawRibbons() { // 在畫布上繪製彩帶動畫
  for (const ribbon of ribbons) { // 逐一繪製每個彩帶粒子
    push(); // 保存目前繪圖狀態
    translate(ribbon.x, ribbon.y); // 移動到彩帶粒子位置
    rotate(ribbon.angle); // 套用彩帶旋轉角度
    noStroke(); // 移除彩帶外框
    fill(ribbon.color[0], ribbon.color[1], ribbon.color[2], 220); // 設定彩帶顏色與透明度
    rectMode(CENTER); // 使用中心點矩形模式繪製彩帶
    rect(0, 0, ribbon.size, ribbon.size * 0.48, 2); // 繪製彩帶矩形
    pop(); // 還原目前繪圖狀態
  } // 結束彩帶繪製迴圈
} // 結束彩帶繪製函式
function mousePressed() { // 接收滑鼠按下事件
  if (!submitted && inside(mouseX, mouseY, layout.submitBox)) { submitQuiz(); return false; } // 按下交卷按鈕時提交測驗
  if (submitted && inside(mouseX, mouseY, layout.restartBox)) { restartQuiz(); return false; } // 按下重新開始按鈕時重設測驗
  return startDrag(mouseX, mouseY); // 其餘情況開始滑鼠拖曳處理
} // 結束滑鼠按下事件
function mouseDragged() { // 接收滑鼠拖曳事件
  return moveDrag(mouseX, mouseY); // 更新滑鼠拖曳預覽位置
} // 結束滑鼠拖曳事件
function mouseReleased() { // 接收滑鼠放開事件
  return endDrag(mouseX, mouseY); // 結束滑鼠拖曳並嘗試放置答案
} // 結束滑鼠放開事件
function touchStarted() { // 接收觸控開始事件
  const touch = touches[0]; // 取得第一個觸控點資料
  if (!touch) { return false; } // 沒有觸控點時結束處理
  if (!submitted && inside(touch.x, touch.y, layout.submitBox)) { submitQuiz(); return false; } // 觸控交卷按鈕時提交測驗
  if (submitted && inside(touch.x, touch.y, layout.restartBox)) { restartQuiz(); return false; } // 觸控重新開始按鈕時重設測驗
  return startDrag(touch.x, touch.y); // 其餘情況開始觸控拖曳處理
} // 結束觸控開始事件
function touchMoved() { // 接收觸控移動事件
  const touch = touches[0]; // 取得第一個觸控點資料
  if (!touch) { return false; } // 沒有觸控點時結束處理
  return moveDrag(touch.x, touch.y); // 更新觸控拖曳預覽位置
} // 結束觸控移動事件
function touchEnded() { // 接收觸控結束事件
  const touch = touches[0]; // 嘗試取得最後一個觸控點資料
  return endDrag(touch ? touch.x : pointerX, touch ? touch.y : pointerY); // 結束觸控拖曳並嘗試放置答案
} // 結束觸控結束事件
function windowResized() { // 接收瀏覽器視窗大小變更事件
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整到最新視窗大小
  updateLayout(); // 立即重新計算響應式版面
} // 結束視窗尺寸變更事件
