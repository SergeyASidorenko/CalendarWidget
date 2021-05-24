/**
* Класс календаря с возиожностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
* @param {*} date_from_input 
* @param {*} date_to_input 
* @param {*} time_start_input 
* @param {*} time_end_input 
* @param {*} date_from_input_reference 
* @param {*} date_to_input_reference 
 * @param  initiator 
 * @param {*} event 
 * @param {*} isSelectDaysInRangeAllowed 
 * @param {*} isLimitPossibleDaysWithRange 
 */
var Calendar = function (date_from_input,
    time_from_input = null,
    date_to_input = null,
    time_to_input = null,
    initiator = null,
    event = 'click',
    isSelectDaysInRangeAllowed = false,
    isLimitPossibleDaysWithRange = false) {
    const JANUARY = 0;
    const FEBRUARY = 1;
    const DECEMBER = 11;
    // Возможный диапазон выбора годов
    const YEARS_RANGE = 48;
    // Флаг указывающий, что нужно создать календарь с возможностью выбора диапазона
    this.isLimitPossibleDaysWithRange = isLimitPossibleDaysWithRange;
    // HTML узел, который будеит содержат всю разметку календаря
    this.dateCalendarContainer = null;
    this.yearsContainer = null;
    this.monthsContainer = null;
    this.daysContainer = null;
    this.timeSelectorContainer = null;
    this.hoursContainer = null;
    this.minutesContainer = null;
    this.hoursSelector = null;
    this.minutesSelector = null;
    this.applyTimeButton = null;
    this.yearIndicator = null;
    this.leafOverFuture = null;
    this.leafOverPast = null;
    //-------------------------------------------
    // Разрешается ли выбор дат в прошлом
    this.isAllowedDatesInThePast = false;
    // Разрешается ли ввод времени
    this.isSelectTimeWithDateTogetherAllowed = false;
    //-------------------------------------------
    this.startPossibleYear = null;
    this.endPossibleYear = null;
    this.startPossibleMonth = null;
    this.endPossibleMonth = null;
    this.startPossibleDay = null;
    this.endPossibleDay = null;
    //-------------------------------------------
    this.selectedYearFrom = null;
    this.yearToSelected = null;
    this.selectedMonthFrom = null;
    this.monthToSelected = null;
    this.dayFromSelected = null;
    this.dayToSelected = null;
    this.hoursFromSelected = null;
    this.hoursToSelected = null;
    this.minutesFromSelected = null;
    this.minutesToSelected = null;
    //-------------------------------------------
    this.dateFromInput = date_from_input;
    this.dateToInput = date_to_input;
    this.timeFromInput = time_from_input;
    this.timeToInput = time_to_input;
    //-------------------------------------------
    this.endYearInRangeByMouseOver = null;
    this.endMonthInRangeByMouseOver = null;
    this.endDayInRangeByMouseOver = null;
    //-------------------------------------------
    this.curDisplayedYear = null;
    this.curDisplayedMonth = null;
    //-------------------------------------------
    // Массив дней, которые нужно отобразить в браузере 
    // и одновременно это массив дней, доступных для выбора
    this.daysToDisplayInCalendar = [];
    // Возможный диапазон выбора дат в днях
    // Это диапазон разобъется пополам и отсчет будеит производиться от текущей даты в будущее и прошлое
    // на количество дней, равное половине этого значения
    this.possibleDaysRange = 6;
    // Массив годов, доступных для выбора пользователем
    this.possibleYears = [];
    // Массив узлов, содержащих долступные к выбору года
    this.yearNodes = [];
    //  Количество отображаемых месяцев в календаре
    this.amountOfMonthsToDisplay = 3;
    this.initiator = initiator;
    this.event = event;
    // Флаг, указывающий, нужно ли пользователю выбирать период, а не просто одну дату
    this.isSelectDaysInRangeAllowed = isSelectDaysInRangeAllowed;
    this.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this.dayContainerNodes = [];
    this.selectTimeEventSource = null;
    this.selectDateEventSource = null;
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
     * Метод определения, отображен ли в момент вызова переданный в качестве аргумента контейнер в окне браузере
     */
    this.isDisplayed = function (container) {
        return window.getComputedStyle(container).display != 'none';
    };
    /**
     * @param year - текущий год
     * @param month - текущий месяц
     * @param day - текущий день
     * Перерисовка календаря на основе новых параметров
     */
    this.fillCaledarWithDays = function (year, month, day = null) {
        this.initDays(year, month, day);
        // Заполняем секцию выбора возможных годов
        let amountOfPossibleYears = this.possibleYears.length;
        this.possibleYears.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
            yearNode.style.width = amountOfPossibleYears + 'px';
            if (!(year in this.yearNodes)) {
                this.yearNodes.push(yearNode);
            }
            this.yearsContainer.appendChild(yearNode);
        }.bind(this));
        // Заполняем сам календарь днями
        this.daysToDisplayInCalendar.forEach(function (months, year) {
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
                monthContainerNode.style.width = 100 / this.amountOfMonthsToDisplay + '%';
                monthContainerNode.appendChild(monthHeading);
                yearContainerNode.appendChild(monthContainerNode);
                let calendarContainerWidth = getNodeWidth(this.dateCalendarContainer, window.innerWidth);
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
                        if (dayInfo.isWeekEnd) {
                            dayInfo.node.classList.add('weekend');
                        }
                        if (!dayInfo.isInRange) {
                            dayInfo.node.classList.add('unactive');
                        }
                        if (dayInfo.margin) {
                            dayInfo.node.style.marginLeft = dayInfo.margin + '%';
                        }
                        monthContainerNode.appendChild(dayInfo.node);
                        dayInfo.isInDOM = true;
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
        this.createDateCalendarContainer();
        this.createTimeSelectorContainer();
        this.dateFromInput.readOnly = true;
        // Добавляем события, по которым будут отображаться календарь и окно выбра времени
        // с учетом возможности использовать внешний элемент для отображения календаря, он хранится в свойсте initiator
        if (this.initiator !== null) {
            this.initiator.addEventListener(this.event, this.switchCalendarWithTimeSelector.bind(this));
        } else {
            this.dateFromInput.addEventListener(this.event, this.switchCalendar.bind(this));
            // Если передат элемент, хранящий время, то считаем, что пользователь будет еще отдельно вводить время
            if (this.timeFromInput !== null) {
                this.timeFromInput.className = 'calendar_time_input';
                this.timeFromInput.readOnly = true;
                // Добавляем событие, по которому будет отображаться окно выбора времени
                this.timeFromInput.addEventListener(this.event, this.switchTimeSelector.bind(this));
            }
            if (this.dateToInput !== null) {
                this.dateToInput.readOnly = true;
                this.dateToInput.addEventListener(this.event, this.switchCalendar.bind(this));
                // Если передат элемент, хранящий время, то считаем, что пользователь будет еще отдельно вводить время
                if (this.timeToInput !== null) {
                    this.timeToInput.className = 'calendar_time_input';
                    this.timeToInput.readOnly = true;
                    this.timeToInput.addEventListener(this.event, this.switchTimeSelector.bind(this,));
                }
            }
        }
        // Добавляем событие обработки нажатий левой кнопки мыши внутри календаря
        this.dateCalendarContainer.addEventListener('click', this.dayClickListener.bind(this));
        // Если доступен выбор диапазона дат, также добавляем обработчик на перемещение мыши - чтобы
        // была подсветка диапазона дат
        if (this.isSelectDaysInRangeAllowed) {
            this.dateCalendarContainer.addEventListener('mouseover', this.onMouseOver.bind(this));
        }
    };
    this.onMouseOver = function (e) {
        if (e.target.classList.contains('day') && this.dayFromSelected !== null && this.dayToSelected === null) {
            let target = e.target;
            // Конечный год диапазона дат, выделенных цветом
            let newEndYearInRangeByMouseOver = parseInt(target.parentNode.parentNode.dataset.number);
            // Конечный месяц диапазона дат, выделенных цветом
            let newEndMonthInRangeByMouseOver = parseInt(target.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let newEndDayInRangeByMouseOver = parseInt(target.dataset.number);
            // Проверяем, не вышли мы при движении мышкой за ращрешенный диапазон выбора дат
            if (this.dayInPossibleRange(newEndDayInRangeByMouseOver, newEndMonthInRangeByMouseOver, newEndYearInRangeByMouseOver)) {
                this.updateHighLightedDays(newEndYearInRangeByMouseOver, newEndMonthInRangeByMouseOver, newEndDayInRangeByMouseOver);
                this.endYearInRangeByMouseOver = newEndYearInRangeByMouseOver;
                this.endMonthInRangeByMouseOver = newEndMonthInRangeByMouseOver;
                this.endDayInRangeByMouseOver = newEndDayInRangeByMouseOver;
            }
        }
    };
    this.dayClickListener = function (e) {
        if (e.target.classList.contains('day') && !e.target.classList.contains('unactive')) {
            let target = e.target;
            // Конечный год диапазона дат, выделенных цветом
            let curYear = parseInt(target.parentNode.parentNode.dataset.number);
            // Конечный месяц диапазона дат, выделенных цветом
            let curMonth = parseInt(target.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let curDay = parseInt(target.dataset.number);
            if (this.isSelectDaysInRangeAllowed) {
                if (this.selectedDayFrom !== null && this.dayToSelected !== null) {
                    this.unHighLightDays();
                    this.clearDateFromInput();
                    this.clearDateToInput();
                }
                if (this.dayFromSelected !== null && this.dayToSelected === null) {
                    // Если новый выделенный период находитсчя внутри предыдущего,
                    // то есть нам нужно убрать подсветку с "хвостика" в конце периода дат
                    if ((this.selectedYearFrom <= curYear &&
                        (this.selectedMonthFrom <= curMonth || (this.selectedMonthFrom > curMonth && this.selectedYearFrom < curYear)) &&
                        (this.dayFromSelected <= curDay || (this.dayFromSelected > curDay && this.selectedMonthFrom < curMonth)))) {
                        this.updateDateToInput(curYear, curMonth, curDay);
                    } else {
                        this.updateDateFromInput(curYear, curMonth, curDay);
                        this.clearDateToInput();
                    }
                }
                else {
                    this.updateDateFromInput(curYear, curMonth, curDay);
                }
            } else {
                // В зависимости от того, какое поле ввода даты было источников события -
                // вызываем соответствующий метод
                if (this.selectDateEventSource.id == 'date_from') {
                    this.updateDateFromInput(curYear, curMonth, curDay);
                } else if (this.selectDateEventSource.id == 'date_to') {
                    this.updateDateToInput(curYear, curMonth, curDay);
                }
                this.switchCalendar(e);
            }
        }
    };
    this.updateHighLightedDays = function (newEnd, newMonth, newDay) {
        if ((this.endYearInRangeByMouseOver === null || this.endMonthInRangeByMouseOver === null || this.endDayInRangeByMouseOver === null) ||
            (this.endYearInRangeByMouseOver <= newEnd &&
                (this.endMonthInRangeByMouseOver <= newMonth || (this.endMonthInRangeByMouseOver > newMonth && this.endYearInRangeByMouseOver < newEnd)) &&
                (this.endDayInRangeByMouseOver <= newDay || (this.endDayInRangeByMouseOver > newDay && this.endMonthInRangeByMouseOver < newMonth)))) {
            var startMonthInCurIteration = this.selectedMonthFrom;
            var startDayInCurIteration = this.dayFromSelected;
            for (let year = this.selectedYearFrom; year <= newEnd; year++) {
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
                        this.daysToDisplayInCalendar[year][month][day].node.classList.add('in_selected_period');
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
                        this.daysToDisplayInCalendar[year][month][day].node.classList.remove('in_selected_period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = this.JANUARY;
            }
        }
    };
    // Удаление подсветки выбранных дат с календаря
    this.unHighLightDays = function () {
        var startMonthInCurIteration = this.selectedMonthFrom;
        var startDayInCurIteration = this.dayFromSelected;
        for (let year = this.selectedYearFrom; year <= this.yearToSelected; year++) {
            var endMonthInCurIteration = null;
            if (year < this.yearToSelected) {
                endMonthInCurIteration = this.DECEMBER;
            } else {
                endMonthInCurIteration = this.monthToSelected;
            }
            for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                var endDayInCurIteration = 0;
                if (month < this.monthToSelected) {
                    endDayInCurIteration = this.getDaysCountOfMonth(year, month);
                } else {
                    endDayInCurIteration = this.dayToSelected;
                }
                for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                    this.daysToDisplayInCalendar[year][month][day].node.classList.remove('in_selected_period');
                }
                startDayInCurIteration = 1;
            }
            startMonthInCurIteration = this.JANUARY;
        }
    };
    /**
    * Обновление даты начала выбранного периода
    */
    this.updateDateTimeFromInputs = function (year, month, day) {
        this.updateDateFromInput(year, month, day);
        this.updateTimeFromInput();
    };

    /**
    * Обновление даты начала выбранного периода
    */
    this.updateDateFromInput = function (year, month, day) {
        this.selectedYearFrom = year;
        this.selectedMonthFrom = month;
        this.dayFromSelected = day;
        let date = new Date();
        date.setFullYear(this.selectedYearFrom);
        date.setMonth(this.selectedMonthFrom);
        date.setDate(this.dayFromSelected);
        this.dateFromInput.value = date.toISOString().slice(0, 10);
    };
    /**
    * Обновление даты начала выбранного периода
    */
    this.updateTimeFromInput = function () {
        this.timeFromInput.value = this.hoursFromSelected + ':' + this.minutesFromSelected;
    };
    /**
   * Обновление даты и времени конца выбранного периода
   */
    this.updateDateTimeToInputs = function (year, month, day) {
        this.updateDateToInput(year, month, day);
        this.updateTimeToInput();
    };
    /**
    * Обновление даты начала выбранного периода
    */
    this.updateDateToInput = function (year, month, day) {
        this.yearToSelected = year;
        this.monthToSelected = month;
        this.dayToSelected = day;
        let date = new Date();
        date.setFullYear(this.yearToSelected);
        date.setMonth(this.monthToSelected);
        date.setDate(this.dayToSelected);
        this.dateToInput.value = date.toISOString().slice(0, 10);
    };
    /**
    * Обновление даты начала выбранного периода
    */
    this.updateTimeToInput = function () {
        this.timeToInput.value = this.hoursToSelected + ':' + this.minutesToSelected;
    };
    /**
    * Очистка даты и времени начала выбранного периода
    */
    this.clearDateTimeFromInputs = function () {
        this.clearDateFromInput();
        this.clearTimeFromInput();
    };
    /**
     * Очистка даты и времени конца выбранного периода
     */
    this.clearDateTimeToInputs = function () {
        this.clearDateToInput();
        this.clearTimeToInput();
    };

    /**
    * Очистка даты и времени конца выбранного периода
    */
    this.clearDateFromInput = function () {
        this.dateFromInput.value = '';
        this.dayFromSelected = this.selectedMonthFrom = this.selectedYearFrom = null;
    };

    /**
    * Очистка даты и времени конца выбранного периода
    */
    this.clearTimeFromInput = function () {
        this.timeFromInput.value = '';
    };

    /**
     * Очистка даты и времени конца выбранного периода
     */
    this.clearDateToInput = function () {
        this.dateToInput.value = '';
        this.dayToSelected = this.monthToSelected = this.yearToSelected = null;
    };

    /**
    * Очистка даты и времени конца выбранного периода
    */
    this.clearTimeToInput = function () {
        this.timeToInput.value = '';
    };
    /**
     * Инициализация массивов годов, месяцев и дней, в том числе с учетом разрешенного
     * диапазона дат
     * @param year - текущий год
     * @param month - текущий месяц
     * @param day - текущий день
     */
    this.initDays = function (year, month, day = null) {
        var date = new Date();
        // Сперва заполняем возможный для выбор диапазон годов
        for (let yearInPossibleRange = year - Math.floor(this.YEARS_RANGE / 2); yearInPossibleRange < year + Math.floor(this.YEARS_RANGE / 2); yearInPossibleRange++) {
            this.possibleYears.push(yearInPossibleRange);
        }
        this.startPossibleYear = this.possibleYears[0];
        this.endPossibleYear = this.possibleYears[this.possibleYears.length - 1];
        this.initDisplayedDaysInCalendar(year, month);
        // Если передана настройка - Предоставлять выбор дат только из определенного периода относительно текущей даты
        if (this.isLimitPossibleDaysWithRange && day !== null) {
            // Инициализация расчета разрешенного периода выбора дат
            this.startPossibleDay = day - Math.floor(this.possibleDaysRange / 2);
            this.endPossibleDay = day + Math.floor(this.possibleDaysRange / 2);
            var curYear = year;
            var curMonth = month;
            this.startPossibleYear = year;
            this.endPossibleYear = year;
            this.startPossibleMonth = month;
            this.endPossibleMonth = month;
            if (this.startPossibleDay < 0) {
                while (startPossibleDay < 0) {
                    curMonth--;
                    this.startPossibleDay = this.startPossibleDay + this.getDaysCountOfMonth(curYear, curMonth);
                }
                this.startPossibleYear = curYear;
                this.startPossibleMonth = curMonth;
            }
            if (this.endPossibleDay > this.getDaysCountOfMonth(year, month)) {
                curYear = year;
                curMonth = month;
                while (endPossibleDay > this.getDaysCountOfMonth(curYear, curMonth)) {
                    curMonth++;
                    this.endPossibleDay = this.endPossibleDay - this.getDaysCountOfMonth(curYear, curMonth);
                }
                this.endPossibleYear = curYear;
                this.endPossibleMonth = curMonth;
            }
        }
        var isInRange = true;
        this.daysToDisplayInCalendar.forEach(function (monthsToDisplay, yearToDisplay) {
            date.setFullYear(yearToDisplay);
            monthsToDisplay.forEach(function (days, monthToDisplay) {
                date.setMonth(monthToDisplay);
                for (let dayToDisplay = 1; dayToDisplay <= this.getDaysCountOfMonth(yearToDisplay, monthToDisplay); dayToDisplay++) {
                    let dayContainerNode = document.createElement('span');
                    dayContainerNode.className = 'day';
                    dayContainerNode.dataset.number = dayToDisplay;
                    dayContainerNode.innerHTML = dayToDisplay;
                    isInRange = true;
                    if (this.isLimitPossibleDaysWithRange) {
                        if (!this.isDateInPossibleRange(yearToDisplay, monthToDisplay, dayToDisplay)) {
                            isInRange = false;
                        }
                    }
                    date.setDate(dayToDisplay);
                    let dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    let dayInfo = { 'node': dayContainerNode, 'isInRange': isInRange, 'isWeekEnd': dayOfWeek == 5 || dayOfWeek == 6, 'isInDOM': false };
                    if (dayToDisplay == 1) {
                        dayInfo.margin = (dayOfWeek / 7) * 100;
                    }
                    this.daysToDisplayInCalendar[yearToDisplay][monthToDisplay][dayToDisplay] = dayInfo;
                };
            }.bind(this));
        }.bind(this));
    };

    /**
     * Отображение календаря в окне браузера
     */
    this.hide = function (container) {
        container.style.display = 'none';
    };

    /**
     * 
     *  Скрытие календаря в окне браузера
     */
    this.show = function (container) {
        container.style.display = 'block';
    };
    /**
     * Переключение каледаря из видимого состояния в невидимое или наоборот
     */
    this.switchCalendar = function (e) {
        let eventSource = e.target;
        this.selectDateEventSource = eventSource;
        if (!this.isDisplayed(this.dateCalendarContainer)) {
            this.dateCalendarContainer.style.top = (eventSource.offsetTop + eventSource.offsetHeight) + 'px';
            this.dateCalendarContainer.style.left = eventSource.offsetLeft + 'px';
            this.show(this.dateCalendarContainer)
        } else {
            this.hide(this.dateCalendarContainer);
        }
    };

    /**
     * Переключение окна выбора времени из видимого состояния в невидимое или наоборот
     */
    this.switchTimeSelector = function (e) {
        let eventSource = e.target;
        this.selectTimeEventSource = eventSource;
        if (!this.isDisplayed(this.timeSelectorContainer)) {
            this.timeSelectorContainer.style.top = (eventSource.offsetTop + eventSource.offsetHeight) + 'px';
            this.timeSelectorContainer.style.left = eventSource.offsetLeft + 'px';
            this.show(this.timeSelectorContainer)
        } else {
            this.hide(this.timeSelectorContainer);
        }
    };

    /**
    * Функционал слайдера, в частности для перелистывания месяцев
    * Перелистывание в прошлое (влево)
    */
    this.leafMonthOverInTheFuture = function () {
        if (this.curDisplayedMonth == this.DECEMBER) {
            this.curDisplayedMonth = this.JANUARY;
        } else {
            this.curDisplayedMonth = this.curDisplayedMonth + 1;
        }
        this.fillCaledarWithDays(this.curDisplayedYEar, this.curDisplayedMonth);
    };

    /**
    * Функционал слайдера, в частности для перелистывания месяцев
    * Перелистывание в будущее (вправо)
    */
    this.leafMonthOverInThePast = function (container) {

    };
    this.initDisplayedDaysInCalendar = function (year, month) {
        var curFutureYear = year;
        var curPastYear = year;
        var curFutureMonth = month;
        var curPastMonth = month;
        this.daysToDisplayInCalendar[year] = [];
        this.daysToDisplayInCalendar[year][month] = [];
        let endMonthLimitToDisplay = 0;
        if (this.isAllowedDatesInThePast) {
            endMonthLimitToDisplay = this.amountOfMonthsToDisplay / 2;
            for (let monthOffset = 1; monthOffset <= endMonthLimitToDisplay; monthOffset++) {
                // Если возможный диапазон выбора дат 
                // захватывает год в будущем, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curFutureMonth == this.DECEMBER) {
                    curFutureMonth = this.JANUARY;
                    curFutureYear++;
                    this.daysToDisplayInCalendar[curFutureYear] = [];
                } else {
                    curFutureMonth++;
                }
                this.daysToDisplayInCalendar[curFutureYear][curFutureMonth] = [];
                // Если возможный диапазон выбора дат разрешает выбор дат в прошлом
                // и если часть диапазона в прошлом захватывает прошлый год, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curPastMonth == this.JANUARY) {
                    curPastMonth = this.DECEMBER;
                    curPastYear--;
                    this.daysToDisplayInCalendar[curPastYear] = [];
                } else {
                    curPastMonth--;
                }
                this.daysToDisplayInCalendar[curPastYear][curPastMonth] = [];
            }
        } else {
            endMonthLimitToDisplay = this.amountOfMonthsToDisplay;
            for (let monthOffset = 1; monthOffset < endMonthLimitToDisplay; monthOffset++) {
                // Если возможный диапазон выбора дат 
                // захватывает год в будущем, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curFutureMonth == this.DECEMBER) {
                    curFutureMonth = this.JANUARY;
                    curFutureYear++;
                    this.daysToDisplayInCalendar[curFutureYear] = [];
                } else {
                    curFutureMonth++;
                }
                this.daysToDisplayInCalendar[curFutureYear][curFutureMonth] = [];
            }
        }

    };
    this.dayInPossibleRange = function (day, month, year) {
        return this.daysToDisplayInCalendar[year][month][day].isInRange;
    };
    this.isDateInPossibleRange = function (year, month, day) {
        if (this.isLimitPossibleDaysWithRange) {
            if (year < this.startPossibleYear || month < this.startPossibleMonth || day < this.startPossibleDay ||
                year > this.endPossibleYear || month > this.endPossibleMonth || day > this.endPossibleDay) {
                return false;
            }
        }
        return true;
    };
    /**
     * Создание верстки окна выбора даты (календаря)
     */
    this.createDateCalendarContainer = function () {
        this.dateCalendarContainer = document.createElement('div');
        this.dateCalendarContainer.id = 'calendar';
        this.dateCalendarContainer.style.display = 'none';
        this.yearsContainer = document.createElement('div');
        this.monthsContainer = document.createElement('div');
        this.daysContainer = document.createElement('div');
        this.yearsContainer.setAttribute('id', 'years');
        this.yearsContainer.style.display = 'none';
        this.monthsContainer.setAttribute('id', 'months');
        this.daysContainer.setAttribute('id', 'days');
        this.yearIndicator = document.createElement('p');
        this.yearIndicator.setAttribute('id', 'year-indicator');
        this.leafOverFuture = document.createElement('span');
        this.leafOverFuture.setAttribute('id', 'leaf-over-future');
        this.leafOverFuture.textContent = '>';
        this.leafOverPast = document.createElement('span');
        this.leafOverPast.setAttribute('id', 'leaf-over-past');
        this.leafOverPast.textContent = '<';
        this.monthsContainer.appendChild(this.leafOverFuture);
        this.monthsContainer.appendChild(this.leafOverPast);
        this.dateCalendarContainer.appendChild(this.yearIndicator);
        this.dateCalendarContainer.appendChild(this.yearsContainer);
        this.dateCalendarContainer.appendChild(this.monthsContainer);
        this.dateCalendarContainer.appendChild(this.daysContainer);
        document.body.appendChild(this.dateCalendarContainer);
        let date = new Date();
        this.curDisplayedYear = date.getFullYear();
        this.curDisplayedMonth = date.getMonth();
        let day = date.getDate();
        this.yearIndicator.textContent = this.curDisplayedYear;
        this.fillCaledarWithDays(this.curDisplayedYear, this.curDisplayedMonth, day);
    };
    /**
     * Создание верстки окна выбора времени
     */
    this.createTimeSelectorContainer = function () {
        this.timeSelectorContainer = document.createElement('div');
        this.timeSelectorContainer.id = 'time-selector';
        this.timeSelectorContainer.style.display = 'none';
        this.timeSelectorContainer.style.top = (this.timeFromInput.offsetTop + this.timeFromInput.offsetHeight) + 'px';
        this.timeSelectorContainer.style.left = this.timeFromInput.offsetLeft + 'px';
        this.hoursContainer = document.createElement('div');
        this.hoursContainer.setAttribute('id', 'hours-container');
        this.timeSelectorContainer.appendChild(this.hoursContainer);
        this.hoursSelector = document.createElement('input');
        this.hoursSelector.type = 'number';
        this.hoursSelector.min = 0;
        this.hoursSelector.max = 23;
        this.hoursSelector.setAttribute('id', 'hours-selector');
        this.hoursContainer.appendChild(this.hoursSelector);
        this.minutesContainer = document.createElement('div');
        this.minutesContainer.setAttribute('id', 'minutes-container');
        this.timeSelectorContainer.appendChild(this.minutesContainer);
        this.minutesSelector = document.createElement('input');
        this.minutesSelector.type = 'number';
        this.minutesSelector.min = 0;
        this.minutesSelector.max = 59;
        this.minutesSelector.setAttribute('id', 'minutes-selector');
        this.minutesContainer.appendChild(this.minutesSelector);
        this.applyTimeButton = document.createElement('button');
        this.applyTimeButton.setAttribute('id', 'apply-time-button');
        this.applyTimeButton.textContent = 'Выбрать';
        this.timeSelectorContainer.appendChild(this.applyTimeButton);
        this.applyTimeButton.addEventListener('click', this.applyButtonClickListener.bind(this));
        document.body.appendChild(this.timeSelectorContainer);
    };
    // Обработчик нажатия кнопки подтверждения выбора времени в окне выбора времени
    this.applyButtonClickListener = function (e) {
        if (this.hoursSelector.value.length > 0 && this.minutesSelector.value.length > 0) {
            if (this.selectTimeEventSource.id == 'time_from') {
                this.hoursFromSelected = this.hoursSelector.value;
                this.minutesFromSelected = this.minutesSelector.value;
                this.updateTimeFromInput();
            } else if (this.selectTimeEventSource.id == 'time_to') {
                this.hoursToSelected = this.hoursSelector.value;
                this.minutesToSelected = this.minutesSelector.value;
                this.updateTimeToInput();
            }
            this.hoursSelector.value = '';
            this.minutesSelector.value = '';
        }
        this.switchTimeSelector(e);
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
let dateFromCalendarInitiator = document.getElementById('date_from');
let timeFrom = document.getElementById('time_from');
let dateFrom = dateFromCalendarInitiator;
let dateToCalendarInitiator = document.getElementById('date_to');
let timeTo = document.getElementById('time_to');
let dateTo = dateToCalendarInitiator;
let calendar = new Calendar(dateFrom, timeFrom, dateTo, timeTo);
calendar.init();