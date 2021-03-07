/**
* Класс календаря с возиожностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
 * @param  initiator 
 * @param {*} event 
 */
var Calendar = function (initiator, event, isSelectDaysRangePossible, isLimitDaysWithARange) {
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
    this.startDisplayedDay = null;
    this.endDisplayedDay = null;
    this.startDisplayedMonth = null;
    this.endDisplayedMonth = null;
    this.startDisplayedYear = null;
    this.endDisplayedYear = null;
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
    this.endYearByMouseOver = null;
    this.endMonthByMouseOver = null;
    this.endDayByMouseOver = null;
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
     * Перерисовка календаря на основе новых параметров
     */
    this.redraw = function () {
        // Заполняем секцию выбора годов
        this.years.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
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
        this.initDays();
        this.redraw();
        this.startDateInput = document.createElement('input');
        this.startDateInput.type = 'text';
        this.startDateInput.readOnly = true;
        this.container.appendChild(this.startDateInput);
        this.startTimeInput = document.createElement('input');
        this.startTimeInput.type = 'text';
        this.startTimeInput.className = 'calendar_time_input';
        this.container.appendChild(this.startTimeInput);
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
        this.initiator.addEventListener(this.event, this.switch.bind(this));
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('day')) {
                let target = e.target;
                if (this.isSelectDaysRangePossible && this.startSelectedDay) {
                    if (parseInt(target.parentNode.parentNode.dataset.number) < this.startSelectedYear ||
                        parseInt(target.parentNode.dataset.number) < this.startSelectedMonth ||
                        parseInt(target.dataset.number) < this.startSelectedDay) {
                        this.startSelectedYear = parseInt(target.parentNode.parentNode.dataset.number);
                        this.startSelectedMonth = parseInt(target.parentNode.dataset.number);
                        this.startSelectedDay = parseInt(target.dataset.number);
                        let date = new Date();
                        date.setFullYear(this.startSelectedYear);
                        date.setMonth(this.startSelectedMonth);
                        date.setDate(this.startSelectedDay);
                        this.startDateInput.value = date.toISOString().slice(0, 10) + ' ' + date.toISOString().slice(11, 16);
                        if (this.startTimeInput.value.trim().length == 0) {
                            this.startTimeInput.value = date.toISOString().slice(11, 16);
                        }
                        this.endDateInput.value = '';
                        this.endTimeInput.value = '';
                    } else {
                        this.endSelectedDay = parseInt(target.dataset.number);
                        this.endSelectedMonth = parseInt(target.parentNode.dataset.number);
                        this.endSelectedYear = parseInt(target.parentNode.parentNode.dataset.number);
                        let date = new Date();
                        date.setFullYear(this.endSelectedYear);
                        date.setMonth(this.endSelectedMonth);
                        date.setDate(this.endSelectedDay);
                        this.endDateInput.value = date.toISOString().slice(0, 10);
                        if (this.endTimeInput.value.trim().length == 0) {
                            this.endTimeInput.value = date.toISOString().slice(11, 16);
                        }
                    }
                } else {
                    this.startSelectedDay = parseInt(target.dataset.number);
                    this.startSelectedMonth = parseInt(target.parentNode.dataset.number);
                    this.startSelectedYear = parseInt(target.parentNode.parentNode.dataset.number);
                    let date = new Date();
                    date.setFullYear(this.startSelectedYear);
                    date.setMonth(this.startSelectedMonth);
                    date.setDate(this.startSelectedDay);
                    this.startDateInput.value = date.toISOString().slice(0, 10) + ' ' + date.toISOString().slice(11, 16);
                    if (this.startTimeInput.value.trim().length == 0) {
                        this.startTimeInput.value = date.toISOString().slice(11, 16);
                    }
                }
            }
        });
        if (this.isSelectDaysRangePossible) {
            this.container.addEventListener('mouseover', (e) => {
                if (e.target.classList.contains('day') && this.startSelectedDay !== null) {
                    let target = e.target;
                    let startDayOfCurrentMonth = this.startSelectedDay;
                    // Конечный год диапазона дат, выделенных цветом
                    let endYearByMouseOver = parseInt(target.parentNode.parentNode.dataset.number);
                    // Конечный месяц диапазона дат, выделенных цветом
                    let endMonthByMouseOver = parseInt(target.parentNode.dataset.number);
                    // Конечная дата диапазона дат, выделенных цветом
                    let endDayByMouseOver = parseInt(target.dataset.number);
                    if (endDayByMouseOver < this.startSelectedDay ||
                        endMonthByMouseOver < this.startSelectedMonth ||
                        endYearByMouseOver < this.startSelectedYear) {
                        // Снимаем подсветку цветом у дней, которые в настоящий момент подсвечены
                        this.unHighLightDays()
                        if (this.daysToShowInCalendar[this.startSelectedYear][this.startSelectedMonth][this.startSelectedDay].node.classList.contains('in_selected_period')) {
                            this.daysToShowInCalendar[this.startSelectedYear][this.startSelectedMonth][this.startSelectedDay].node.classList.remove('in_selected_period');
                        }
                        return;
                    }

                    for (let year = this.startSelectedYear; year <= endYearByMouseOver; year++) {
                        for (let month = this.startSelectedMonth; month <= endMonthByMouseOver; month++) {
                            for (let day = startDayOfCurrentMonth; day <= endDayOfMonth; day++) {
                                if (year <= endYearByMouseOver && month <= endMonthByMouseOver && day <= endDayByMouseOver) {
                                    if (!this.daysToShowInCalendar[year][month][day].node.classList.contains('in_selected_period')) {
                                        this.daysToShowInCalendar[year][month][day].node.classList.add('in_selected_period');
                                    }
                                } else {
                                    if (this.daysToShowInCalendar[year][month][day].node.classList.contains('in_selected_period')) {
                                        this.daysToShowInCalendar[year][month][day].node.classList.remove('in_selected_period');
                                    }
                                }
                            }
                            startDayOfCurrentMonth = 1;
                        }
                    }
                    this.endYearByMouseOver = endYearByMouseOver;
                    this.endMonthByMouseOver = endMonthByMouseOver;
                    this.endDayByMouseOver = endDayByMouseOver;
                }
            });
            this.container.addEventListener('mouseout', (e) => {
                if (e.target == this) {
                    console.log('test');
                }
            });
        }
    };
    this.unHighLightDays = function () { };
    /**
    * Обновление даты начала периода
    */
    this.updateStartDate = function (date, time) {
        if (date !== undefined) {
            this.startDateInput.value = date + ' ' + date.toISOString().slice(11, 16);
        }
        if (time !== undefined) {
            this.startDateInput.value = date.toISOString().slice(0, 10) + ' ' + time;
        }
    };
    /**
   * Обновление даты конца периода
   */
    this.updateEndDate = function (date, time) {
        if (date !== undefined) {
            this.endDateInput.value = date + ' ' + date.toISOString().slice(11, 16);
        }
        if (time !== undefined) {
            this.endDateInput.value = date.toISOString().slice(0, 10) + ' ' + time;
        }
    };
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
            this.startPossibleYear = this.years[0];
            this.endPossibleYear = this.years[this.years.length - 1];
        }
        this.daysToShowInCalendar[year] = [];
        this.daysToShowInCalendar[year][month] = [];
        let startPossibleDayNumberInMonth = 1;
        let endPossibleDayNumberInMonth = this.getDaysCountOfMonth(month, year);
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
                    leftDaysCount = leftDaysCount + this.getDaysCountOfMonth(curMonthNumber, curYear);
                }
                startPossibleDayNumberInMonth = leftDaysCount;
                this.startPossibleYear = curYear;
                this.startPossibleMonth = curMonthNumber;
            }
            if (endPossibleDayNumberInMonth > this.getDaysCountOfMonth(month, year)) {
                curYear = year;
                curMonthNumber = month;
                leftDaysCount = endPossibleDayNumberInMonth;
                while (leftDaysCount > this.getDaysCountOfMonth(curMonthNumber, curYear)) {
                    curMonthNumber++
                    if (curMonthNumber > 11) {
                        curMonthNumber = 0;
                        curYear++;
                        this.possibleDays[curYear] = [];
                    }
                    this.possibleDays[curYear][curMonthNumber] = [];
                    leftDaysCount = leftDaysCount - this.getDaysCountOfMonth(curMonthNumber, curYear);
                }
                endPossibleDayNumberInMonth = leftDaysCount;
                this.endPossibleYear = curYear;
                this.endPossibleMonth = curMonthNumber;
            }
            this.daysToShowInCalendar = this.possibleDays;
        }
        let isInPeriod = true;
        this.daysToShowInCalendar.forEach(function (months, year) {
            date.setFullYear(year);
            months.forEach(function (days, month) {
                date.setMonth(month);
                for (let day = 1; day <= this.getDaysCountOfMonth(month, year); day++) {
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