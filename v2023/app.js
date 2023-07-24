const DUCO = "ᕲ";
const DUCO_USERNAME = "duco_username";
const DUCO_REST_API = "https://server.duinocoin.com";
const BALANCE_HISTORY = "balance_history";
const PRICE_USD_HISTORY = "price_usd_history";

const monthText = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const colors = [
  config.colors.primary,
  config.colors.secondary,
  config.colors.success,
  config.colors.danger,
  config.colors.warning,
  config.colors.info,
  config.colors.dark,
  config.colors.black,
  "#E7E7FF",
  "#EBEEF0",
  "#E8FADF",
  "#FFE0DB",
  "#FFF2D6",
  "#D7F5FC",
  "#DCDFE1",
];

const lightColors = [
  "#E7E7FF",
  "#EBEEF0",
  "#E8FADF",
  "#FFE0DB",
  "#FFF2D6",
  "#D7F5FC",
  "#DCDFE1",
  config.colors.primary,
  config.colors.secondary,
  config.colors.success,
  config.colors.danger,
  config.colors.warning,
  config.colors.info,
  config.colors.dark,
  config.colors.black,
];

let cardColor, headingColor, axisColor, shadeColor, borderColor;

cardColor = config.colors.white;
headingColor = config.colors.headingColor;
axisColor = config.colors.axisColor;
borderColor = config.colors.borderColor;

let username = localStorage.getItem(DUCO_USERNAME) ?? "siunusdev";
let balance = 0,
  balanceUSD = 0,
  priceUSD = 0;

$(document).ready(() => {
  setUsername(username);
  console.log("Ready", getUsername());

  getUserData();
  getStatistics();
  getNews();
});

$(".form-change-username").on("submit", function (e) {
  e.preventDefault();
  const newUsername = $(this).find("input.username").val();
  checkUsername(newUsername, $(this));
});

invalidInput = function (element, text) {
  element.removeClass("is-invalid");
  element.parent().find(".invalid-feedback").remove();

  if (text != null) {
    element.addClass("is-invalid");
    element.parent().append(`<div class="invalid-feedback">${text}</div>`);
    element.focus();
  }
};

addZero = function (x) {
  return x < 10 ? `0${x}` : x;
};

thousands = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

dateYmdHis = function (date = new Date()) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(
    date.getSeconds()
  )}`;
};

datejMHi = function (date = new Date()) {
  return `${monthText[date.getMonth()]} ${addZero(date.getDate())}, ${addZero(
    date.getHours()
  )}:${addZero(date.getMinutes())}`;
};

dateHis = function (date = new Date()) {
  return `${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(
    date.getSeconds()
  )}`;
};

hashrateFormatted = function (val) {
  let hashrate = val;
  let hashrate_unit = " H/s";

  if (hashrate > 1000) {
    hashrate = hashrate / 1000;
    hashrate_unit = " KH/s";
  }

  if (hashrate > 1000) {
    hashrate = hashrate / 1000;
    hashrate_unit = " MH/s";
  }

  if (hashrate > 1000) {
    hashrate = hashrate / 1000;
    hashrate_unit = " GH/s";
  }

  return hashrate.toFixed(2) + hashrate_unit;
};

checkUsername = function (username, form = null) {
  $.ajax({
    method: "GET",
    url: `${DUCO_REST_API}/users/${username}`,
  })
    .done(function (res) {
      console.log(res);

      if (res.success) {
        setUsername(username);
        if (form != null) form.find(".modal").modal("hide");
        location.reload();
      } else {
        if (form != null)
          invalidInput(form.find("input.username"), res.message);
      }
    })
    .fail(function (err) {
      console.error(err);
    });
};

setUsername = function (newUsername) {
  username = newUsername;
  localStorage.setItem(DUCO_USERNAME, username);
  $("span.username").text(username);
  $("input.username").val(username);
};

getUsername = function () {
  return localStorage.getItem(DUCO_USERNAME);
};

getUserData = function () {
  $.ajax({
    method: "GET",
    url: `${DUCO_REST_API}/users/${username}`,
  })
    .done(function (res) {
      // console.log(res);

      if (res.success) {
        setUserData(res);
      }
    })
    .fail(function (err) {
      console.error(err);
    })
    .always(function () {
      setTimeout(getUserData, 5000);
    });
};

setUserData = function (data) {
  const accountInfo = $("#account-info");

  let info = "";

  if (data.result?.balance?.verified == "yes") {
    info +=
      '<i class="bx bxs-badge-check text-primary me-1"></i> Verified <br/>';
  } else {
    info += '<i class="bx bxs-badge text-warning me-1"></i> Not verified <br/>';
  }

  info += `<i class="bx bxs-award text-primary me-1"></i> ${data.result?.balance?.trust_score} Trust Score<br/>`;

  accountInfo.html(info);

  balance = data.result?.balance?.balance ?? 0;
  setBalance(balance);
  setBalanceHistory(balance);
  setMiners(data.result?.miners ?? []);
  setLastTransactions(data?.result?.transactions ?? []);
};

setBalance = function (balance) {
  const ducoBalance = $("#duco-balance");
  const ducoBalanceUSD = $("#duco-balance-usd");

  balanceUSD = balance * priceUSD;

  ducoBalance.text(`${DUCO} ${balance.toFixed(4)}`);
  ducoBalanceUSD.text(`~ $${balanceUSD.toFixed(2)}`);
};

setBalanceHistory = function (balance) {
  const duco24hProfit = $("#duco-24h-profit");

  let history = localStorage.getItem(`${username}_${BALANCE_HISTORY}`);

  if (history == undefined) {
    history = {};
  } else {
    history = JSON.parse(history);
  }

  const lastBalance = Object.values(history).pop() ?? 0;

  if (balance > lastBalance) {
    const key = new Date().getTime();

    history[key] = balance;
    localStorage.setItem(
      `${username}_${BALANCE_HISTORY}`,
      JSON.stringify(history)
    );
  }

  if (Object.keys(history).length > 1) {
    const last1_key = Object.keys(history)[Object.keys(history).length - 1];
    const last1_val = history[last1_key];

    const last2_key = Object.keys(history)[Math.max(0, Object.keys(history).length - 100)];
    const last2_val = history[last2_key];

    let balanceChangeTime = last1_key - last2_key;
    let mined = last1_val - last2_val;
    let minedInSec = mined / (balanceChangeTime / 1000);
    let minedInHour = minedInSec * 3600;
    let minedInDay = minedInHour * 24;

    duco24hProfit.text(`ᕲ ${minedInDay.toFixed(4)}`);
  }

  var _index = 0;
  var _lastKey = "x";
  var _incomeSeriesData = [];
  var _incomeSeriesCategories = [];

  for (_key in history) {
    if (_index > 1) {
      const bal = history[_key];
      const last_bal = history[_lastKey];
      _incomeSeriesData[_incomeSeriesData.length] = bal - last_bal;
      _incomeSeriesCategories[_incomeSeriesCategories.length] = dateHis(
        new Date(+_key)
      );
    }

    _index++;
    _lastKey = _key;
  }

  updateIncomeChart(_incomeSeriesData, _incomeSeriesCategories);
};

setMiners = function (miners) {
  const activeMinersCount = $("#active-miners-count");
  const acceptedPercentage = $("#accepted-percentage");
  const totalHashrate = $("#total-hashrate");
  const tableMiners = $("#table-miners");

  let hashrates = 0,
    accepted = 0,
    rejected = 0;

  let tableRows = "";
  let num = 0;
  for (i in miners) {
    num++;
    hashrates += miners[i].hashrate;
    accepted += miners[i].accepted;
    rejected += miners[i].rejected;

    tableRows += `<tr id="${miners[i].threadid}">
            <th scope="row">${num}</th>
            <td>${miners[i].software}</td>
            <td>${miners[i].algorithm}</td>
            <td class="text-success">${miners[i].accepted}</td>
            <td class="text-danger">${miners[i].rejected}</td>
            <td>${miners[i].hashrate} H/s</td>
            <td>${miners[i].diff}</td>
            <td>${miners[i].pool}</td>
            <td>${miners[i].identifier}</td>
          </tr>`;
  }

  if (tableRows != "") {
    tableMiners.find("tbody").html(tableRows);
  }

  const percentage = (accepted / (accepted + rejected)) * 100;

  activeMinersCount.text(miners.length);
  acceptedPercentage.text(`${percentage.toFixed(2)}% accepted`);
  totalHashrate.text(hashrateFormatted(hashrates));
};

setLastTransactions = function (transactions) {
  const listLastTransactions = $("#list-last-transactions");

  transactions = transactions.slice(-7);

  let listRows = "";
  for (i in transactions) {
    const trx = transactions[i];
    const color = trx.sender == username ? "danger" : "success";
    const sender =
      trx.sender == username
        ? `to <strong>${trx.recipient}</strong>`
        : `from <strong>${trx.sender}</strong>`;
    const amount = trx.sender == username ? `-${trx.amount}` : `+${trx.amount}`;

    listRows += `<li class="d-flex mb-4 pb-1">
            <div class="avatar flex-shrink-0 me-3">
              <span class="badge bg-label-${color} p-2">
                <i class="bx bx-wallet text-${color} fs-4"></i>
              </span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-top gap-2">
              <div class="me-2 flex-grow-1">
                <small class="text-muted d-block mb-1">${sender}</small>
                <h6 class="mb-0">${trx.memo}</h6>
              </div>
              <div class="user-progress gap-1" style="text-align:right">
                <small class="text-muted d-block mb-1">${trx.datetime}</small>
                <h6 class="mb-0 text-${color}">${amount} <small class="text-muted">DUCO</small></h6>
              </div>
            </div>
          </li>`;
  }

  if (listRows != "") {
    listLastTransactions.html(listRows);
  }
};

getStatistics = function () {
  $.ajax({
    method: "GET",
    url: `${DUCO_REST_API}/statistics`,
  })
    .done(function (res) {
      // console.log(res);
      setStatistics(res);
    })
    .fail(function (err) {
      console.error(err);
    })
    .always(function () {
      setTimeout(getStatistics, 5000);
    });
};

setStatistics = function (data) {
  const ducoBalanceUSD = $("#duco-balance-usd");

  priceUSD = data?.["Duco price"];
  balanceUSD = balance * priceUSD;
  ducoBalanceUSD.text(`~ $${balanceUSD.toFixed(2)}`);

  setPriceUSDHistory(priceUSD);
  setMinerDist(data?.["Miner distribution"]);
  setTopRichest(data?.["Top 10 richest miners"]);
};

setPriceUSDHistory = function (price) {
  const ducoPriceUSD = $("#duco-price-usd");
  const priceChangeDiff = $("#price-change-diff");

  ducoPriceUSD.text(`$${price}`);

  let history = localStorage.getItem(PRICE_USD_HISTORY);

  if (history == undefined) {
    history = {};
  } else {
    history = JSON.parse(history);
  }

  const lastPrice = Object.values(history).pop() ?? 0;

  if (price != lastPrice) {
    const key = new Date().getTime();

    history[key] = price;
    localStorage.setItem(PRICE_USD_HISTORY, JSON.stringify(history));
  }

  if (Object.keys(history).length > 1) {
    const last1_key = Object.keys(history)[Object.keys(history).length - 1];
    const last1_val = history[last1_key];

    const last2_key = Object.keys(history)[Object.keys(history).length - 2];
    const last2_val = history[last2_key];

    let change = last1_val - last2_val;

    if (change > 0) {
      priceChangeDiff.removeClass("text-danger");
      priceChangeDiff.addClass("text-success");
      priceChangeDiff.html(
        `<i class="bx bx-chevron-up"></i> $${change.toFixed(8)}`
      );
    } else {
      change = change * -1;
      priceChangeDiff.removeClass("text-success");
      priceChangeDiff.addClass("text-danger");
      priceChangeDiff.html(
        `<i class="bx bx-chevron-down"></i> $${change.toFixed(8)}`
      );
    }
  }

  var _priceSeriesData = [];
  var _priceSeriesCategories = [];

  for (_key in history) {
    _priceSeriesData[_priceSeriesData.length] = history[_key];
    _priceSeriesCategories[_priceSeriesCategories.length] = datejMHi(
      new Date(+_key)
    );
  }

  updatePriceChart(_priceSeriesData, _priceSeriesCategories);
};

setMinerDist = function (data) {
  const totalMinerDist = $("#total-miner-dist");
  const listMinerDist = $("#list-miner-dist");
  const dataArray = Object.entries(data);

  dataArray.sort((a, b) => b[1] - a[1]);

  const sortedData = Object.fromEntries(dataArray);

  let listRows = "";
  let series = [];
  let labels = [];

  let _index = 0;
  for (dev in sortedData) {
    // console.log(dev, sortedData[dev]);

    if (dev == "All") {
      totalMinerDist.text(sortedData[dev]);
    } else {
      if (sortedData[dev] > 0) {
        series[series.length] = sortedData[dev];
        labels[labels.length] = dev;

        listRows += `<li class="d-flex mb-3 pb-1">
                <div class="avatar flex-shrink-0 me-3">
                  <span class="avatar-initial rounded" style="background-color:${
                    lightColors[_index]
                  }">
                    <i class="bx bx-chip" style="color:${colors[_index]}"></i>
                  </span>
                </div>
                <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                  <div class="me-2">
                    <h6 class="mb-0">${dev}</h6>
                    <small class="text-muted">${(
                      (sortedData[dev] / sortedData["All"]) *
                      100
                    ).toFixed(2)}%</small>
                  </div>
                  <div class="user-progress">
                    <small class="fw-semibold">${sortedData[dev]}</small>
                  </div>
                </div>
              </li>`;

        _index++;
      }
    }
  }

  listMinerDist.html(listRows);
  updateMinerDistChart(series, labels, colors);
};

setTopRichest = function (data) {
  const tableTopRichest = $("#table-top-richest");

  let tableRows = "";
  let num = 0;

  for (i in data) {
    const row = data[i].split("-");
    const balance = row[0].replaceAll("DUCO", "");
    const price = +balance * priceUSD;

    num++;
    tableRows += `<tr>
            <td>${num}</td>
            <td>
              <div class="d-flex align-items-center">
                <img src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${
                  row[1]
                }" alt="" height="24" class="me-2 rounded-circle">
                <span>${row[1]}</span>
              </div>
            </td>
            <td>${DUCO} ${(+balance).toFixed(4)}</td>
            <td>$ ${(+price).toFixed(8)}</td>
          </tr>`;
  }

  tableTopRichest.find("tbody").html(tableRows);
};

const incomeChartEl = document.querySelector("#incomeChart");
const incomeChartConfig = {
  series: [],
  chart: {
    height: 215,
    parentHeightOffset: 0,
    parentWidthOffset: 0,
    toolbar: {
      show: false,
    },
    type: "area",
    animations: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 2,
    curve: "smooth",
  },
  legend: {
    show: false,
  },
  markers: {
    size: 6,
    colors: "transparent",
    strokeColors: "transparent",
    strokeWidth: 4,
    discrete: [
      {
        fillColor: config.colors.white,
        seriesIndex: 0,
        dataPointIndex: 14,
        strokeColor: config.colors.primary,
        strokeWidth: 2,
        size: 6,
        radius: 8,
      },
    ],
    hover: {
      size: 7,
    },
  },
  colors: [config.colors.primary],
  fill: {
    type: "gradient",
    gradient: {
      shade: shadeColor,
      shadeIntensity: 0.6,
      opacityFrom: 0.5,
      opacityTo: 0.25,
      // stops: [0, 95, 100],
    },
  },
  grid: {
    borderColor: borderColor,
    strokeDashArray: 3,
    padding: {
      top: -20,
      bottom: -8,
      left: -10,
      right: 8,
    },
  },
  xaxis: {
    categories: [],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: true,
      style: {
        fontSize: "13px",
        colors: axisColor,
      },
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
    // min: 10,
    // max: 50,
    // tickAmount: 4,
  },
  noData: {
    text: "Loading...",
  },
};
if (typeof incomeChartEl !== undefined && incomeChartEl !== null) {
  var incomeChart = new ApexCharts(incomeChartEl, incomeChartConfig);
  incomeChart.render();
}

updateIncomeChart = function (series = [], categories = []) {
  const maxData = 15;
  const incomeMax = $("#income-max");
  const incomeMin = $("#income-min");
  const incomeAvg = $("#income-avg");

  if (series.length > 0) {
    incomeMax.text(Math.max(...series).toFixed(8));
    incomeMin.text(Math.min(...series).toFixed(8));
    incomeAvg.text((series.reduce((x, y) => x + y) / series.length).toFixed(8));
  }

  series = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...series];
  categories = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ...categories,
  ];

  series = series.slice(maxData * -1);
  categories = categories.slice(maxData * -1);
  categories[0] = "";

  incomeChart.updateOptions({
    series: [
      {
        name: "ᕲ",
        data: series,
      },
    ],
    xaxis: {
      categories: categories,
    },
  });
};

const priceHistoryChartEl = document.querySelector("#priceHistory");
const priceHistoryChartConfig = {
  chart: {
    height: 80,
    // width: 175,
    type: "line",
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 10,
      left: 5,
      blur: 3,
      color: config.colors.warning,
      opacity: 0.15,
    },
    sparkline: {
      enabled: true,
    },
  },
  grid: {
    show: false,
    padding: {
      top: 8,
      right: 8,
      bottom: 8,
    },
  },
  colors: [config.colors.warning],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 4,
    curve: "smooth",
  },
  series: [],
  xaxis: {
    categories: [],
    show: false,
    lines: {
      show: false,
    },
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
};
if (typeof priceHistoryChartEl !== undefined && priceHistoryChartEl !== null) {
  var priceHistoryChart = new ApexCharts(
    priceHistoryChartEl,
    priceHistoryChartConfig
  );
  priceHistoryChart.render();
}

updatePriceChart = function (series = [], categories = []) {
  const maxData = 6;

  series = [0, 0, 0, 0, 0, 0, ...series];
  categories = ["", "", "", "", "", "", ...categories];

  series = series.slice(maxData * -1);
  categories = categories.slice(maxData * -1);
  categories[0] = "";

  priceHistoryChart.updateOptions({
    series: [
      {
        name: "$",
        data: series,
      },
    ],
    xaxis: {
      categories: categories,
    },
  });
};

const minerDistChartEl = document.querySelector("#minerDistChart");
const minerDistChartConfig = {
  chart: {
    height: 165,
    width: 130,
    type: "donut",
  },
  labels: [],
  series: [],
  colors: [],
  stroke: {
    width: 5,
    colors: [cardColor],
  },
  dataLabels: {
    enabled: false,
    formatter: function (val, opt) {
      return parseInt(val) + "%";
    },
  },
  legend: {
    show: false,
  },
  grid: {
    padding: {
      top: 0,
      bottom: 0,
      right: 15,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
        labels: {
          show: true,
          value: {
            fontSize: "1.5rem",
            fontFamily: "Public Sans",
            color: headingColor,
            offsetY: -15,
            formatter: function (val, w) {
              let total = 0;
              for (i in w.config.series) {
                total += w.config.series[i];
              }
              let percent = (val / total) * 100;
              return parseInt(percent) + "%";
            },
          },
          name: {
            offsetY: 20,
            fontFamily: "Public Sans",
          },
          total: {
            show: false,
            fontSize: "0.8125rem",
            color: axisColor,
            label: "Total",
            formatter: function (w) {
              let total = 0;
              for (i in w.config.series) {
                total += w.config.series[i];
              }
              return thousands(total);
            },
          },
        },
      },
    },
  },
};
if (typeof minerDistChartEl !== undefined && minerDistChartEl !== null) {
  var minerDistChart = new ApexCharts(minerDistChartEl, minerDistChartConfig);
  minerDistChart.render();
}

updateMinerDistChart = function (_series = [], _labels = [], _colors = []) {
  if (
    JSON.stringify(_series) !== JSON.stringify(minerDistChart.getSeriesTotal())
  ) {
    minerDistChart.updateOptions({
      labels: _labels,
      series: _series,
      colors: _colors,
    });
  }
};

getNews = function () {
  $.ajax({
    method: "GET",
    url: `${DUCO_REST_API}/news`,
  })
    .done(function (res) {
      // console.log(res);
      parseNews(res);
    })
    .fail(function (err) {
      console.error(err);
    })
    .always(function () {
      setTimeout(getNews, 1000 * 60);
    });
};

function stripTags(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

parseNews = function (html) {
  const listNews = $("#list-news");
  let newsData = [];

  if (html.indexOf('<p class="title is-size-6 m-0">') >= 0) {
    const htmls = html.split('<p class="title is-size-6 m-0">');

    htmls.forEach((element, i) => {
      if (i > 0) {
        let title = "";
        let content = "";
        let author = "";
        let avatar = "";
        let datetime = "";

        if (element.indexOf('<strong class="heading is-size-6 mb-0">') >= 0) {
          title = element.split('<strong class="heading is-size-6 mb-0">')[1];
          title = title.split("</strong>")[0];
        }

        if (element.indexOf('<span class="has-text-weight-normal">') >= 0) {
          content = element.split('<span class="has-text-weight-normal">')[1];
          content = content.split(" </span>")[0];
          content = content.replaceAll(
            "img src",
            'img class="mb-2" style="max-width: 100%" src'
          );
          content = content.replaceAll("<B>", "<b>");
          content = content.replaceAll("<script", "<noscript");
          content = content.replaceAll("/script>", "/noscript>");
        }

        if (element.indexOf("Posted by") >= 0) {
          author = element.split("Posted by")[1];
          datetime = author.split("<br>")[1];
          datetime = datetime.split("</div>")[0];
          author = author.split("<br>")[0];
          author = author.replaceAll("<b>", '<span class="text-muted">');
          author = author.replaceAll("</b>", "</span>");
        }

        if (element.indexOf('<figure class="image is-24x24">') >= 0) {
          avatar = element.split('<figure class="image is-24x24">')[1];
          avatar = avatar.split("</figure>")[0];
          avatar = avatar.split('src="')[1];
          avatar = avatar.split('"')[0];
        }

        newsData[newsData.length] = {
          title: stripTags(title),
          content: content,
          author: author.trim(),
          datetime: datetime.trim(),
          avatar: avatar.trim(),
        };
      }
    });
  }

  let newsHtml = "";
  for (i in newsData) {
    const news = newsData[i];
    const title =
      news.title != ""
        ? `<h5 class="card-title text-primary mb-4">${news.title}</h5>`
        : "";

    newsHtml += `<div class="card mb-4">
            <div class="card-body">
              ${title}
              <div class="card-subtitle text-muted mb-4">
                <span class="d-flex">
                  <div class="d-flex align-items-center me-3">
                    <img src="https://server.duinocoin.com/${news.avatar}" alt="" height="24" class="me-2 rounded-circle">
                    <span>${news.author}</span>
                  </div>
                  <span class="me-3">
                    <i class="bx bx-time"></i> ${news.datetime}
                  </span>
                </span>
              </div>
              <p class="card-text" style="line-height: 2">
                ${news.content}
              </p>
            </div>
          </div>`;
  }

  if (newsHtml != "") {
    listNews.html(newsHtml);
  }
};
