/**
* Класс календаря с возиожностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
 * @param  initiator 
 * @param {*} event 
 */
var Calendar = function (initiator, event, isSelectDaysRangePossible, isLimitDaysWithARange) {
    const JANUARY = 0;
    const FEBRUARY = 1;
    const DECEMBER = 11;
    // Флаг указывающий, что нужно создать календарь с возможностью выбора диапазона
    this.isLimitDaysWithARange = isLimitDaysWithARange;
    // HTML узел, который будеит содержат всю разметку календаря
    this.container = null;
    this.yearsContainer = null;
    this.monthsContainer = null;
    this.daysContainer = null;
    //-------------------------------------------
    this.startPossibleYear = null;
    this.endPossibleYear = null;
    this.startPossibleMonth = null;
    this.endPossibleMonth = null;
    this.startPossibleDay = null;
    this.endPossibleDay = null;
    //-------------------------------------------
    this.startSelectedYear = null;
    this.endSelectedYear = null;
    this.startSelectedMonth = null;
    this.endSelectedMonth = null;
    this.startSelectedDay = null;
    this.endSelectedDay = null;
    this.startDateInput = null;
    this.endDateInput = null;
    this.startTimeInput = null;
    this.endTimeInput = null;
    //-------------------------------------------
    this.endYearInRangeByMouseOver = null;
    this.endMonthInRangeByMouseOver = null;
    this.endDayInRangeByMouseOver = null;
    //-------------------------------------------
    // Массив дней, которые нужно отобразить в браузере
    this.daysToShowInCalendar = [];
    // Массив дней, доступных для выбора пользователем
    this.possibleDays = [];
    // Возможный диапазон выбора годов
    this.yearsRange = 40;
    // Возможный диапазон выбора дат в днях
    // Это диапазон разобъется пополам и отсчет будеит производиться от текущей даты в будущее и прошлое
    // на количество дней, равное половине этого значения
    this.possibleDaysRange = 100;
    // Массив годов, доступных для отображения
    this.years = [];
    // Массив годов, доступных для выбора пользователем
    this.possibleYears = [];
    // Массив узлов, содержащих долступные к выбору года
    this.yearNodes = [];

    this.initiator = initiator;
    this.event = event;
    // Флаг, указывающий, нужно ли пользователю выбирать период, а не просто одну дату
    this.isSelectDaysRangePossible = isSelectDaysRangePossible;
    this.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this.dayContainerNodes = [];
    /**
     * Определение количества дней в месяце данного года
     * @param {*} month 
     * @param {*} year 
     */
    this.getDaysCountOfMonth = function (year, month) {
        if (month == this.FEBRUARY) {
            return year % 4 == 0 ? 29 : 28;
        }
        if (month == this.DECEMBER) {
            return 31;
        }
        return month % 2 == 0 ? 31 : 30;
    };
    /**
     * Определение русского наименования месяца
     * @param {*} month 
     */
    this.getMonthName = function (month) {
        return this.monthNames[month];
    };
    /**
     * Метод определения, отображен ли в момент вызова календарь в окне браузере
     */
    this.isDisplayed = function () {
        return window.getComputedStyle(this.container).display != 'none';
    };
    /**
     * @param year - текущий год
     * @param month - текущий месяц
     * @param day - текущий день
     * Перерисовка календаря на основе новых параметров
     */
    this.draw = function (year, month, day) {
        this.initDays(year, month, day);
        // Заполняем секцию выбора возможных годов
        this.years.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
            if (!(year in this.yearNodes)) {
                this.yearNodes.push(yearNode);
            }
            this.yearsContainer.appendChild(yearNode);
        }.bind(this));
        // Заполняем сам календарь днями
        this.daysToShowInCalendar.forEach(function (months, year) {
            let yearContainerNode = document.createElement('div');
            yearContainerNode.className = 'year_container';
            yearContainerNode.dataset.number = year;
            this.daysContainer.appendChild(yearContainerNode);
            months.forEach(function (days, month) {
                let monthHeading = document.createElement('h4');
                monthHeading.innerHTML = this.getMonthName(month);
                let monthContainerNode = document.createElement('div');
                monthContainerNode.className = 'month_container';
                monthContainerNode.dataset.number = month;
                monthContainerNode.appendChild(monthHeading);
                yearContainerNode.appendChild(monthContainerNode);
                let calendarContainerWidth = getNodeWidth(this.container, window.innerWidth);
                let monthContainerNodeWidth = getNodeWidth(monthContainerNode, calendarContainerWidth);
                // -------------------------------------------------------------------------
                // Временно создаем и добавляем элемент, содержащий дату, в дерево HTML документа, чтобы вычислить размер в пикселях
                // дабы получить отображение этого элемента в виде квадрата
                let dayContainerNode = document.createElement('span');
                dayContainerNode.className = 'day'
                monthContainerNode.appendChild(dayContainerNode);
                let dayDivWidth = getNodeWidth(dayContainerNode, monthContainerNodeWidth);
                monthContainerNode.removeChild(dayContainerNode);
                // -------------------------------------------------------------------------
                days.forEach(function (dayInfo) {
                    if (!dayInfo.isInDOM) {
                        if (dayInfo.isInPeriod) {
                            dayInfo.node.classList.add('active');
                        }
                        if (dayInfo.isWeekEnd) {
                            dayInfo.node.classList.add('weekend');
                        }
                        if (dayInfo.margin !== undefined) {
                            dayInfo.node.style.marginLeft = dayInfo.margin + '%';
                        }
                        monthContainerNode.appendChild(dayInfo.node);
                    }
                    dayInfo.node.style.height = dayDivWidth + 'px';
                }.bind(this));
            }.bind(this));
        }.bind(this));
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
        this.startDateInput = document.createElement('input');
        this.startDateInput.type = 'text';
        this.startDateInput.readOnly = true;
        this.container.appendChild(this.startDateInput);
        this.startTimeInput = document.createElement('input');
        this.startTimeInput.type = 'text';
        this.startTimeInput.className = 'calendar_time_input';
        this.container.appendChild(this.startTimeInput);
        // Если разрешается ввод диапазона дат - создаем новый input
        if (this.isSelectDaysRangePossible) {
            this.endDateInput = document.createElement('input');
            this.endDateInput.type = 'text';
            this.endDateInput.readOnly = true;
            this.container.appendChild(this.endDateInput);
            this.endTimeInput = document.createElement('input');
            this.endTimeInput.type = 'text';
            this.endTimeInput.className = 'calendar_time_input';
            this.container.appendChild(this.endTimeInput);
        }
        // Добавляем событие, по которому будет отображаться календарь
        this.initiator.addEventListener(this.event, this.switch.bind(this));
        // Добавляем событие обработки нажатий левой кнопки мыши внутри календаря
        this.container.addEventListener('click', this.onMouseClick.bind(this));
        // Если доступен выбор диапазона дат, также добавляем обработчик на перемещение мыши - чтобы
        // была подсветка диапазона дат
        if (this.isSelectDaysRangePossible) {
            this.container.addEventListener('mouseover', this.onMouseOver.bind(this));
        }
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        this.draw(year, month, day);
    };
    this.onMouseOver = function (e) {
        if (e.target.classList.contains('day') && this.startSelectedDay !== null && this.endSelectedDay === null) {
            let target = e.target;
            // Конечный год диапазона дат, выделенных цветом
            let newEndYearInRangeByMouseOver = parseInt(target.parentNode.parentNode.dataset.number);
            // Конечный месяц диапазона дат, выделенных цветом
            let newEndMonthInRangeByMouseOver = parseInt(target.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let newEndDayInRangeByMouseOver = parseInt(target.dataset.number);
            this.updateHighLightedDays(newEndYearInRangeByMouseOver, newEndMonthInRangeByMouseOver, newEndDayInRangeByMouseOver);
            this.endYearInRangeByMouseOver = newEndYearInRangeByMouseOver;
            this.endMonthInRangeByMouseOver = newEndMonthInRangeByMouseOver;
            this.endDayInRangeByMouseOver = newEndDayInRangeByMouseOver;
        }
    };
    this.onMouseClick = function (e) {
        if (e.target.classList.contains('day') && e.target.classList.contains('active')) {
            let target = e.target;
            // Конечный год диапазона дат, выделенных цветом
            let curYear = parseInt(target.parentNode.parentNode.dataset.number);
            // Конечный месяц диапазона дат, выделенных цветом
            let curMonth = parseInt(target.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let curDay = parseInt(target.dataset.number);
            if (this.isSelectDaysRangePossible) {
                if (this.startSelectedDay !== null && this.endSelectedDay !== null) {
                    this.unHighLightDays();
                    this.clearStartDateTime();
                    this.clearEndDateTime();
                }
                if (this.startSelectedDay !== null && this.endSelectedDay === null) {
                    if ((this.startSelectedYear <= curYear &&
                        (this.startSelectedMonth <= curMonth || (this.startSelectedMonth > curMonth && this.startSelectedYear < curYear)) &&
                        (this.startSelectedDay <= curDay || (this.startSelectedDay > curDay && this.startSelectedMonth < curMonth)))) {
                        this.updateEndDateTime(curYear, curMonth, curDay);
                    } else {
                        this.updateStartDateTime(curYear, curMonth, curDay);
                        this.clearEndDateTime();
                    }
                }
                else {
                    this.updateStartDateTime(curYear, curMonth, curDay);
                }
            }
        }
    };
    this.updateHighLightedDays = function (newEnd, newMonth, newDay) {
        if ((this.endYearInRangeByMouseOver === null || this.endMonthInRangeByMouseOver === null || this.endDayInRangeByMouseOver === null) ||
            (this.endYearInRangeByMouseOver <= newEnd &&
                (this.endMonthInRangeByMouseOver <= newMonth || (this.endMonthInRangeByMouseOver > newMonth && this.endYearInRangeByMouseOver < newEnd)) &&
                (this.endDayInRangeByMouseOver <= newDay || (this.endDayInRangeByMouseOver > newDay && this.endMonthInRangeByMouseOver < newMonth)))) {
            var startMonthInCurIteration = this.startSelectedMonth;
            var startDayInCurIteration = this.startSelectedDay;
            for (let year = this.startSelectedYear; year <= newEnd; year++) {
                var endMonthInCurIteration = null;
                if (year < newEnd) {
                    endMonthInCurIteration = this.DECEMBER;
                } else {
                    endMonthInCurIteration = newMonth;
                }
                for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                    var endDayInCurIteration = 0;
                    if (month < newMonth) {
                        endDayInCurIteration = this.getDaysCountOfMonth(year, month);
                    } else {
                        endDayInCurIteration = newDay;
                    }
                    for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                        this.daysToShowInCalendar[year][month][day].node.classList.add('in_selected_period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = this.JANUARY;
            }
        } else {
            var startMonthInCurIteration = newMonth;
            var startDayInCurIteration = newDay;
            for (let year = newEnd; year <= this.endYearInRangeByMouseOver; year++) {
                var endMonthInCurIteration = null;
                if (year < this.endYearInRangeByMouseOver) {
                    endMonthInCurIteration = this.DECEMBER;
                } else {
                    endMonthInCurIteration = this.endMonthInRangeByMouseOver;
                }
                for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                    var endDayInCurIteration = 0;
                    if (month < this.endMonthInRangeByMouseOver) {
                        endDayInCurIteration = this.getDaysCountOfMonth(year, month);
                    } else {
                        endDayInCurIteration = this.endDayInRangeByMouseOver;
                    }
                    for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                        this.daysToShowInCalendar[year][month][day].node.classList.remove('in_selected_period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = this.JANUARY;
            }
        }
    };
    // Удаление подсветки выбранных дат с календаря
    this.unHighLightDays = function () {
        var startMonthInCurIteration = this.startSelectedMonth;
        var startDayInCurIteration = this.startSelectedDay;
        for (let year = this.startSelectedYear; year <= this.endSelectedYear; year++) {
            var endMonthInCurIteration = null;
            if (year < this.endSelectedYear) {
                endMonthInCurIteration = this.DECEMBER;
            } else {
                endMonthInCurIteration = this.endSelectedMonth;
            }
            for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                var endDayInCurIteration = 0;
                if (month < this.endSelectedMonth) {
                    endDayInCurIteration = this.getDaysCountOfMonth(year, month);
                } else {
                    endDayInCurIteration = this.endSelectedDay;
                }
                for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                    this.daysToShowInCalendar[year][month][day].node.classList.remove('in_selected_period');
                }
                startDayInCurIteration = 1;
            }
            startMonthInCurIteration = this.JANUARY;
        }
    };
    /**
    * Обновление даты начала выбранного периода
    */
    this.updateStartDateTime = function (year, month, day) {
        this.startSelectedYear = year;
        this.startSelectedMonth = month;
        this.startSelectedDay = day;
        let date = new Date();
        date.setFullYear(this.startSelectedYear);
        date.setMonth(this.startSelectedMonth);
        date.setDate(this.startSelectedDay);
        this.startDateInput.value = date.toISOString().slice(0, 10) + ' ' + date.toISOString().slice(11, 16);
        if (this.startTimeInput.value.trim().length == 0) {
            this.startTimeInput.value = date.toISOString().slice(11, 16);
        }
    };
    /**
   * Обновление даты и времени конца выбранного периода
   */
    this.updateEndDateTime = function (year, month, day) {
        this.endSelectedYear = year;
        this.endSelectedMonth = month;
        this.endSelectedDay = day;
        let date = new Date();
        date.setFullYear(this.endSelectedYear);
        date.setMonth(this.endSelectedMonth);
        date.setDate(this.endSelectedDay);
        this.endDateInput.value = date.toISOString().slice(0, 10);
        if (this.endTimeInput.value.trim().length == 0) {
            this.endTimeInput.value = date.toISOString().slice(11, 16);
        }
    };

    /**
    * Очистка даты и времени начала выбранного периода
    */
    this.clearStartDateTime = function () {
        this.startDateInput.value = '';
        this.startTimeInput.value = '';
        this.startSelectedDay = this.startSelectedMonth = this.startSelectedYear = null;
    };
    /**
     * Очистка даты и времени конца выбранного периода
     */
    this.clearEndDateTime = function () {

        this.endDateInput.value = '';
        this.endTimeInput.value = '';
        this.endSelectedDay = this.endSelectedMonth = this.endSelectedYear = null;

    };
    /**
     * Инициализация массивов годов, месяцев и дней, в том числе с учетом разрешенного
     * диапазона дат
     */
    this.initDays = function (year, month, day) {
        // Сперва заполняем возможный для выбор диапазон годов
        for (let yearInPossibleRange = year - Math.floor(this.yearsRange / 2); yearInPossibleRange < year + Math.floor(this.yearsRange / 2); yearInPossibleRange++) {
            this.years.push(yearInPossibleRange);
            this.startPossibleYear = this.years[0];
            this.endPossibleYear = this.years[this.years.length - 1];
        }
        this.daysToShowInCalendar[year] = [];
        this.daysToShowInCalendar[year][month] = [];
        let startPossibleDayNumberInMonth = 1;
        let endPossibleDayNumberInMonth = this.getDaysCountOfMonth(year, month);
        // Если передана настройка - Предоставлять выбор дат только из определенного периода относительно текущей даты
        if (this.isLimitDaysWithARange) {
            this.possibleDays[year] = [];
            this.possibleDays[year][month] = [];
            // Инициализация расчета разрешенного периода выбора дат
            startPossibleDayNumberInMonth = day - Math.floor(this.possibleDaysRange / 2);
            endPossibleDayNumberInMonth = day + Math.floor(this.possibleDaysRange / 2);
            let curYear = year;
            let curMonthNumber = month;
            this.startPossibleYear = year;
            this.endPossibleYear = year;
            this.startPossibleMonth = month;
            this.endPossibleMonth = month;
            if (startPossibleDayNumberInMonth < 0) {
                let leftDaysCount = startPossibleDayNumberInMonth;
                while (leftDaysCount < 0) {
                    curMonthNumber--;
                    if (curMonthNumber < 0) {
                        curMonthNumber = 11;
                        curYear--;
                        this.possibleDays[curYear] = [];
                    }
                    this.possibleDays[curYear][curMonthNumber] = [];
                    leftDaysCount = leftDaysCount + this.getDaysCountOfMonth(curYear, curMonthNumber);
                }
                startPossibleDayNumberInMonth = leftDaysCount;
                this.startPossibleYear = curYear;
                this.startPossibleMonth = curMonthNumber;
            }
            if (endPossibleDayNumberInMonth > this.getDaysCountOfMonth(year, month)) {
                curYear = year;
                curMonthNumber = month;
                leftDaysCount = endPossibleDayNumberInMonth;
                while (leftDaysCount > this.getDaysCountOfMonth(curYear, curMonthNumber)) {
                    curMonthNumber++
                    if (curMonthNumber > 11) {
                        curMonthNumber = 0;
                        curYear++;
                        this.possibleDays[curYear] = [];
                    }
                    this.possibleDays[curYear][curMonthNumber] = [];
                    leftDaysCount = leftDaysCount - this.getDaysCountOfMonth(curYear, curMonthNumber);
                }
                endPossibleDayNumberInMonth = leftDaysCount;
                this.endPossibleYear = curYear;
                this.endPossibleMonth = curMonthNumber;
            }
            this.daysToShowInCalendar = this.possibleDays;
        }
        let isInPeriod = true;
        var date = new Date();
        this.daysToShowInCalendar.forEach(function (months, year) {
            date.setFullYear(year);
            months.forEach(function (days, month) {
                date.setMonth(month);
                for (let day = 1; day <= this.getDaysCountOfMonth(year, month); day++) {
                    let dayContainerNode = document.createElement('span');
                    dayContainerNode.className = 'day';
                    dayContainerNode.dataset.number = day;
                    dayContainerNode.innerHTML = day;
                    isInPeriod = true;
                    if (this.isSelectDaysRangePossible && (year == this.startPossibleYear && month == this.startPossibleMonth && day < startPossibleDayNumberInMonth) ||
                        (year == this.endPossibleYear && month == this.endPossibleMonth && day > endPossibleDayNumberInMonth)) {
                        isInPeriod = false;
                    }
                    date.setDate(day);
                    let dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    let dayInfo = { 'node': dayContainerNode, 'isInPeriod': isInPeriod, 'isWeekEnd': dayOfWeek == 5 || dayOfWeek == 6, 'isInDOM': false };
                    if (day == 1) {
                        dayInfo.margin = (dayOfWeek / 7) * 100;
                    }
                    this.daysToShowInCalendar[year][month][day] = dayInfo;
                };
            }.bind(this));
        }.bind(this));
    };
    /**
     * Отображение календаря в окне браузера
     */
    this.hide = function () {
        this.container.style.display = 'none';
    };
    /**
     * 
     *  Скрытие календаря в окне браузера
     */
    this.show = function () {
        this.container.style.display = 'block';
    };
    /**
     * Переключение каледаря из видимого состояния в невидимое или наоборот
     */
    this.switch = function () {
        if (!this.isDisplayed()) {
            this.show()
        } else {
            this.hide();
        }
    };
    this.slideLeft = function (container) {

    }
    this.slideRight = function (container) {

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
let c = new Calendar(initiator, 'click', true, true);
c.init();