/**
* Класс календаря с возиожностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
 * @param  initiator 
 * @param {*} event 
 */
var Calendar = function (initiator, event, isPeriod) {
    // HTML узел, который будеит содержат всю разметку календаря
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
    // Возможный диапазон выбора годов
    this.yearsRange = 40;
    // Возможный диапазон выбора дат в днях
    // Это диапазон разобъется пополам и отсчет будеит производиться от текущей даты в будущее и прошлое
    // на количество дней, равное половине этого значения
    this.daysRangeToChoose = 100;
    // Массив годов, доступных для отображения
    this.years = [];
    // Массив годов, доступных для выбора пользователем
    this.yearsToChoose = [];
    // Массив дней, доступных для выбора пользователем
    this.daysToChoose = [];
    this.initiator = initiator;
    this.event = event;
    // Флаг, указывающий, нужно ли пользователю выбирать период, а не просто одну дату
    this.isPeriod = isPeriod;
    this.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    /**
     * Определение количества дней в месяце данного года
     * @param {*} month 
     * @param {*} year 
     */
    this.getDaysCountOfMonth = function (month, year) {
        if (month == 1) {
            if (year === undefined) {
                year = new Date().getFullYear();
            }
            return year % 4 == 0 ? 29 : 28;
        }
        if (month == 11) {
            return 31;
        }
        return month % 2 == 0 ? 31 : 30;
    }
    /**
     * Определение русского наименования месяца
     * @param {*} month 
     */
    this.getMonthName = function (month) {
        return this.monthNames[month];
    }
    /**
     * Метод определения, отображен ли в момент вызова календарь в окне браузере
     */
    this.isDisplayed = function () {
        return window.getComputedStyle(this.container).display != 'none';
    };
    /**
     * Инициализация календаря
     * Создание и добавление нужных узлов в дерево HTML документа
     * Инициализация размеров некоторых элементов
     */
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
            // Временно создаем и добавляем элемнт, содержащий дату, в дерево HTML документа, чтобы вычислить размер в пикселях
            // дабы получить отображение этого элемента в виде квадрата
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
    /**
     * Инициализация массивов годов, месяцев и дней, в том числе с учетом разрешенного
     * диапазона дат
     */
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
        // Инициализация расчета разрешенного периода выбора дат
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
    /**
     * Отображение календаря в окне браузера
     */
    this.hide = function () {
        this.container.style.display = 'none';
    }
    /**
     * 
     *  Скрытие календаря в окне браузера
     */
    this.show = function () {
        this.container.style.display = 'block';
    }
    /**
     * Переключение каледаря из видимого состояния в невидимое или наоборот
     */
    this.switch = function () {
        if (!this.isDisplayed()) {
            this.show()
        } else {
            this.hide();
        }
    }
}
/**
 * Вспомогательная функция расчета размера элемента 
 * в пикселях на основе декларации размера ширины в пикселах из
 * правила CSS относительно размера ширины его родительского узла
 * @param {*} node 
 * @param {*} parentWidth 
 */
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

