var Calendar = function (initiator, event) {
    this.container = null;
    this.yearsContainer = null;
    this.monthsContainer = null;
    this.daysContainer = null;
    this.startYear = null;
    this.startDay = null;
    this.startMonth = null;
    this.endYear = null;
    this.endDay = null;
    this.endMonth = null;
    this.startDisplayedDay = null;
    this.endDisplayedDay = null;
    this.startDisplayedMonth = null;
    this.endDisplayedMonth = null;
    this.startDisplayedYear = null;
    this.endDisplayedYear = null;
    this.yearsRange = 40;
    this.daysRangeToChoose = 100;
    this.years = [];
    this.yearsToChoose = [];
    this.daysToChoose = [];
    this.initiator = initiator;
    this.event = event;
    this.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this.getDaysCountOfMonth = function (month, year) {
        if (year === undefined) {
            year = new Date().getFullYear();
        }
        if (month == 1) {
            return year % 4 == 0 ? 29 : 28;
        }
        if (month == 11) {
            return 31;
        }
        return month % 2 == 0 ? 31 : 30;
    }
    this.getMonthName = function (month) {
        return this.monthNames[month];
    }
    this.isDisplayed = function () {
        return window.getComputedStyle(this.container).display != 'none';
    };
    this.isPeriod = false;
    this.init = function () {
        this.container = document.getElementById('calendar');
        this.container.style.display = 'none';
        this.container.style.top = (this.initiator.offsetTop + this.initiator.offsetHeight) + 'px';
        this.container.style.left = this.initiator.offsetLeft + 'px';
        this.yearsContainer = document.createElement('div');
        this.monthsContainer = document.createElement('div');
        this.daysContainer = document.createElement('div');
        this.yearsContainer.setAttribute('id', 'years');
        this.monthsContainer.setAttribute('id', 'months');
        this.daysContainer.setAttribute('id', 'days');
        this.container.appendChild(this.yearsContainer);
        this.container.appendChild(this.monthsContainer);
        this.container.appendChild(this.daysContainer);
        this.initDays();
        this.years.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
            this.yearsContainer.appendChild(yearNode);
        }.bind(this));
        this.daysToChoose.forEach(function (monthData, monthIndex) {
            let monthNode = document.createElement('div');
            let monthHeading = document.createElement('h4');
            monthHeading.innerHTML = this.getMonthName(monthData.month);
            monthNode.className = 'days_in_month';
            monthNode.appendChild(monthHeading);
            this.daysContainer.appendChild(monthNode);
            let calendarContainerWidth = getNodeWidth(this.container, window.innerWidth);
            let monthNodeWidth = getNodeWidth(monthNode, calendarContainerWidth);
            // -------------------------------------------------------------------------
            let dayNode = document.createElement('span');
            dayNode.className = 'day';
            monthNode.appendChild(dayNode);
            let dayDivWidth = getNodeWidth(dayNode, monthNodeWidth);
            monthNode.removeChild(dayNode);
            // -------------------------------------------------------------------------
            monthData.days.forEach(function (dayInfo, dayIndex) {
                let dayNode = document.createElement('span');
                dayNode.className = 'day';
                dayNode.innerHTML = dayInfo.day;
                if (dayInfo.isInPeriod) {
                    dayNode.classList.add('active');
                }
                if (dayInfo.isWeekEnd) {
                    dayNode.classList.add('weekend');
                }
                if (dayInfo.margin !== undefined) {
                    dayNode.style.marginLeft = dayInfo.margin + '%';
                }
                monthNode.appendChild(dayNode);
                dayNode.style.height = dayDivWidth + 'px';
            }.bind(this));
        }.bind(this));
        this.initiator.addEventListener(this.event, this.switch.bind(this));
    }
    this.initDays = function () {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        for (let index = year - Math.floor(this.yearsRange / 2); index < year + Math.floor(this.yearsRange / 2); index++) {
            this.years.push(index);
            this.startYear = this.years[0];
            this.endYear = this.years[this.years.length - 1];
        }
        let startDay = day - Math.floor(this.daysRangeToChoose / 2);
        let endDay = day + Math.floor(this.daysRangeToChoose / 2);

        this.yearsToChoose[year] = [month];
        let curYear = year;
        let curMonthNumber = month;
        let startYearToChoose = year;
        let endYearToChoose = year;
        if (startDay < 0) {
            let leftDaysCount = startDay;
            while (leftDaysCount < 0) {
                curMonthNumber--;
                if (curMonthNumber < 0) {
                    curMonthNumber = 11;
                    curYear--;
                    this.yearsToChoose[curYear] = [];
                }
                this.yearsToChoose[curYear].unshift(curMonthNumber);
                leftDaysCount = leftDaysCount + this.getDaysCountOfMonth(curMonthNumber, curYear);
            }
            startDay = leftDaysCount;
            startYearToChoose = curYear;
        }
        if (endDay > this.getDaysCountOfMonth(month, year)) {
            curYear = year;
            curMonthNumber = month;
            leftDaysCount = endDay;
            while (leftDaysCount > this.getDaysCountOfMonth(curMonthNumber, curYear)) {
                curMonthNumber++
                if (curMonthNumber > 11) {
                    curMonthNumber = 0;
                    curYear++;
                    this.yearsToChoose[curYear] = [];
                }
                this.yearsToChoose[curYear].push(curMonthNumber);
                leftDaysCount = leftDaysCount - this.getDaysCountOfMonth(curMonthNumber, curYear);
            }
            endDay = leftDaysCount;
            endYearToChoose = curYear;
        }
        let isInPeriod = true;
        this.yearsToChoose.forEach(function (months, yearIndex) {
            date.setFullYear(yearIndex);
            for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
                date.setMonth(months[monthIndex]);
                this.daysToChoose.push({ 'month': months[monthIndex], 'days': [] });
                for (let day = 1; day <= this.getDaysCountOfMonth(months[monthIndex], yearIndex); day++) {
                    isInPeriod = true;
                    if ((yearIndex == startYearToChoose && monthIndex == 0 && day < startDay) ||
                        (yearIndex == endYearToChoose && monthIndex == months.length - 1 && day > endDay)) {
                        isInPeriod = false;
                    }
                    date.setDate(day);
                    let dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    let dayInfo = { 'day': day, 'isInPeriod': isInPeriod, 'isWeekEnd': dayOfWeek == 5 || dayOfWeek == 6 };
                    if (day == 1) {
                        dayInfo.margin = (dayOfWeek / 7) * 100;
                    }
                    this.daysToChoose[this.daysToChoose.length - 1].days.push(dayInfo);
                }
                dayNumber = 1;
            }
        }.bind(this));
    }
    this.hide = function () {
        this.container.style.display = 'none';
    }
    this.show = function () {
        this.container.style.display = 'block';
    }
    this.switch = function () {
        if (!this.isDisplayed()) {
            this.show()
        } else {
            this.hide();
        }
    }
}
function getNodeWidth(node, parentWidth) {
    let nodeWidth = window.getComputedStyle(node).width;
    if (nodeWidth.indexOf('%') != -1) {
        nodeWidth = parentWidth * parseInt(nodeWidth) / 100;
    } else {
        nodeWidth = parseInt(nodeWidth);
    }
    return nodeWidth;
}
let initiator = document.getElementById('select_date');
let c = new Calendar(initiator, 'click');
c.init();

