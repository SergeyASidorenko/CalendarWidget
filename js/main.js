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
    possibleDaysRange = 100,
    isSelectDaysInRangeAllowed = false,
    isLimitPossibleDaysWithRange = false) {
    // Некоторые часто встречающиеся константы в коде
    this.JANUARY = 0;
    this.FEBRUARY = 1;
    this.AUGUST = 7;
    this.DECEMBER = 11;
    this.MAX_DAYS_AMOUNT_IN_MONTH = 31;
    this.DAYS_IN_WEEK = 7;
    this.MONDAY = 0;
    this.SUNDAY = 6;
    // Возможный диапазон выбора годов
    this.YEARS_RANGE = 48;
    // Флаг указывающий, что нужно создать календарь с возможностью выбора диапазона
    this.isLimitPossibleDaysWithRange = isLimitPossibleDaysWithRange;
    // HTML узел, который будеит содержат всю разметку календаря
    this.dateCalendarContainer = null;
    this.yearsContainer = null;
    this.monthsContainer = null;
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
    // Разрешается ли ввод времени в том же окне, где и выбор даты
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
    this.curYear = null;
    this.curMonth = null;
    this.curDay = null;
    //-------------------------------------------
    // Массив дней, которые нужно отобразить в браузере 
    // и одновременно это массив дней, доступных для выбора
    this.displayedYearToMonthsArray = [];
    // Возможный диапазон выбора дат в днях
    // Это диапазон разобъется пополам и отсчет будеит производиться от текущей даты в будущее и прошлое
    // на количество дней, равное половине этого значения
    this.possibleDaysRange = possibleDaysRange;
    // Массив годов, доступных для выбора пользователем
    this.possibleYears = [];
    // Массив узлов, содержащих долступные к выбору года
    this.yearNodes = [];
    //  Количество отображаемых месяцев в календаре
    this.amountOfMonthsToDisplay = 3;
    //  Количество рядов элементов, предназначенных для выбора годов
    this.amountOfRowsForYears = 4;
    this.initiator = initiator;
    this.event = event;
    // Флаг, указывающий, нужно ли пользователю выбирать период, а не просто одну дату
    this.isSelectDaysInRangeAllowed = isSelectDaysInRangeAllowed;
    this.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this.dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Суб', 'Вс'];
    this.dayNodes = [];
    this.selectTimeEventSource = null;
    this.selectDateEventSource = null;
    this.dayNodeWidth = 0;
    this.dayNodeHighlightColor = '#bbb';
    this.dayUnderCursorFrame = null;
    /**
     * Определение количества дней в месяце данного года
     * @param {*} month 
     * @param {*} year 
     */
    this.getDaysCountOfMonth = function (year, month) {
        if (month <= this.AUGUST) {
            if (month == this.FEBRUARY) {
                return year % 4 == 0 ? 29 : 28;
            } else if (month == this.AUGUST) {
                return 31;
            } else {
                return month % 2 == 0 ? 31 : 30;
            }
        } else {
            if (month == this.DECEMBER) {
                return 31;
            } else {
                return month % 2 == 0 ? 30 : 31;
            }
        }
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
     * Отрисовка календаря
     */
    this.draw = function () {
        this.calculateDayRangesToDisplayInCalendar();
        this.createDateCalendarContainer();
        this.createTimeSelectorContainer();
        var date = new Date();
        // Заполняем сам календарь днями
        var isInRange = true;
        var dayOfWeek = 0;
        var isWeekEnd = false;
        var dayNodeCSSMargin = 0;
        var daysCountOfCurMonth = 0;
        var monthIndex = 0;
        var dayContainerNode = null;
        var dayNode = null;
        this.displayedYearToMonthsArray.forEach(function (monthsToDisplay, yearToDisplay) {
            date.setFullYear(yearToDisplay);
            monthsToDisplay.forEach(function (days, monthToDisplay) {
                daysCountOfCurMonth = this.getDaysCountOfMonth(yearToDisplay, monthToDisplay);
                date.setMonth(monthToDisplay);
                let monthContainerNode = this.monthsContainer.getElementsByClassName('month-container')[monthIndex];
                monthContainerNode.dataset.number = monthToDisplay;
                monthContainerNode.dataset.yearNumber = yearToDisplay;
                let monthHeadingNode = monthContainerNode.getElementsByClassName('month-heading')[0];
                monthHeadingNode.textContent = this.getMonthName(monthToDisplay);
                for (let dayToDisplay = 1; dayToDisplay <= daysCountOfCurMonth; dayToDisplay++) {
                    dayNodeCSSMargin = 0;
                    dayContainerNode = document.createElement('div');
                    dayContainerNode.className = 'day-container';
                    dayNode = document.createElement('span');
                    dayNode.className = 'day';
                    dayContainerNode.dataset.number = dayToDisplay;
                    dayNode.textContent = dayToDisplay;
                    dayContainerNode.style.height = this.dayNodeWidth + 'px';
                    dayNode.style.lineHeight = this.dayNodeWidth + 'px';
                    dayContainerNode.appendChild(dayNode);
                    monthContainerNode.appendChild(dayContainerNode);
                    isInRange = true;
                    if (this.isLimitPossibleDaysWithRange) {
                        if (!this.isDateInPossibleRange(yearToDisplay, monthToDisplay, dayToDisplay)) {
                            isInRange = false;
                        }
                    }
                    date.setDate(dayToDisplay);
                    dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    dayContainerNode.dataset.dayOfWeek = dayOfWeek;
                    isWeekEnd = dayOfWeek == 5 || dayOfWeek == 6;
                    if (dayToDisplay == 1) {
                        dayNodeCSSMargin = (dayOfWeek / 7) * 100;
                    }
                    if (isWeekEnd) {
                        dayContainerNode.classList.add('weekend');
                    }
                    if (!isInRange) {
                        dayContainerNode.classList.add('unactive');
                    }
                    if (dayNodeCSSMargin) {
                        dayContainerNode.style.marginLeft = dayNodeCSSMargin + '%';
                    }
                };
                monthIndex++;
            }.bind(this));
        }.bind(this));
    };

    /**
     * Перерисовка календаря на основе новых параметров
     */
    this.redraw = function () {
        var date = new Date();
        this.calculateDayRangesToDisplayInCalendar();
        this.yearIndicator.textContent = this.getYearIndicatorBasedOnCalculatedDaysToDisplay();
        var daysCountOfCurMonth = 0;
        var monthIndex = 0;
        var dayContainerNode = null;
        var dayNode = null;
        // На этот раз мы уже не создаем новый элементы дерева DOM
        // а используем уже имеющиеся, просто обновляем их аттрибуты в соответствии 
        // с новыми парметрами календаря
        this.displayedYearToMonthsArray.forEach(function (months, yearToDisplay) {
            date.setFullYear(yearToDisplay);
            months.forEach(function (val, monthToDisplay) {
                daysCountOfCurMonth = this.getDaysCountOfMonth(yearToDisplay, monthToDisplay);
                date.setMonth(monthToDisplay);
                let curMonthContainer = this.monthsContainer.getElementsByClassName('month-container')[monthIndex];
                let monthHeadingNode = curMonthContainer.getElementsByClassName('month-heading')[0];
                monthHeadingNode.textContent = this.getMonthName(monthToDisplay);
                curMonthContainer.dataset.number = monthToDisplay;
                curMonthContainer.dataset.yearNumber = yearToDisplay;
                for (let dayToDisplay = 1; dayToDisplay <= daysCountOfCurMonth; dayToDisplay++) {
                    dayNodeCSSMargin = 0;
                    dayContainerNode = this.getDOMNodeByAttributeValue(curMonthContainer, 'data-number', dayToDisplay);
                    // Если текущего дня еще нет в DOM календаря данного года и месяца -
                    // создаем его
                    if (!dayContainerNode) {
                        dayContainerNode = document.createElement('div');
                        dayContainerNode.className = 'day-container';
                        dayNode = document.createElement('span');
                        dayNode.className = 'day';
                        dayContainerNode.dataset.number = dayToDisplay;
                        dayNode.textContent = dayToDisplay;
                        dayContainerNode.style.height = this.dayNodeWidth + 'px';
                        dayNode.style.lineHeight = this.dayNodeWidth + 'px';
                        dayContainerNode.appendChild(dayNode);
                        curMonthContainer.appendChild(dayContainerNode);
                    } else {
                        dayNode = dayContainerNode.getElementsByClassName('day')[0];
                    }
                    isInRange = true;
                    if (this.isLimitPossibleDaysWithRange) {
                        if (!this.isDateInPossibleRange(yearToDisplay, monthToDisplay, dayToDisplay)) {
                            isInRange = false;
                        }
                    }
                    date.setDate(dayToDisplay);
                    dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    dayContainerNode.dataset.dayOfWeek = dayOfWeek;
                    isWeekEnd = dayOfWeek == 5 || dayOfWeek == 6;
                    if (dayToDisplay == 1) {
                        dayNodeCSSMargin = (dayOfWeek / 7) * 100;
                    }
                    if (isWeekEnd) {
                        if (!dayContainerNode.classList.contains('weekend')) {
                            dayContainerNode.classList.add('weekend');
                        }
                    } else {
                        if (dayContainerNode.classList.contains('weekend')) {
                            dayContainerNode.classList.remove('weekend');
                        }
                    }
                    if (!isInRange) {
                        if (!dayContainerNode.classList.contains('unactive')) {
                            dayContainerNode.classList.add('unactive');
                        }
                    } else {
                        if (dayContainerNode.classList.contains('unactive')) {
                            dayContainerNode.classList.remove('unactive');
                        }
                    }
                    if (dayNodeCSSMargin) {
                        dayContainerNode.style.marginLeft = dayNodeCSSMargin + '%';
                    }
                };
                // Если в текущем месяце меньше 31 дня, то проверяем, возможно есть
                // узлы дней из предыдущего календаря (с предыдущими настройками)
                // со значением больше мксимального номера дня в текущем месяце
                if (daysCountOfCurMonth < this.MAX_DAYS_AMOUNT_IN_MONTH) {
                    let dayContainerNodeToRemove = null;
                    for (let i = daysCountOfCurMonth + 1; i <= this.MAX_DAYS_AMOUNT_IN_MONTH; i++) {
                        dayContainerNodeToRemove = this.getDOMNodeByAttributeValue(curMonthContainer, 'data-number', i);
                        if (dayContainerNodeToRemove) {
                            dayContainerNodeToRemove.parentNode.removeChild(dayContainerNodeToRemove);
                        }
                    }
                }
                monthIndex++;
            }.bind(this));
        }.bind(this));
    };

    /**
     * Инициализация календаря
     * Создание и добавление нужных узлов в дерево HTML документа
     * Инициализация размеров некоторых элементов
     */
    this.init = function () {
        let date = new Date();
        this.curYear = date.getFullYear();
        this.curMonth = date.getMonth();
        this.curDay = date.getDate();
        this.curDisplayedYear = this.curYear;
        this.curDisplayedMonth = this.curMonth;
        this.draw();
        this.dateFromInput.readOnly = true;
        // Добавляем события, по которым будут отображаться календарь и окно выбра времени
        // с учетом возможности использовать внешний элемент для отображения календаря, он хранится в свойсте initiator
        if (this.initiator !== null) {
            this.initiator.addEventListener(this.event, this.switchCalendarWithTimeSelector.bind(this));
        } else {
            this.dateFromInput.addEventListener(this.event, this.switchCalendar.bind(this));
            // Если передат элемент, хранящий время, то считаем, что пользователь будет еще отдельно вводить время
            if (this.timeFromInput !== null) {
                this.timeFromInput.className = 'calendar-time-input';
                this.timeFromInput.readOnly = true;
                // Добавляем событие, по которому будет отображаться окно выбора времени
                this.timeFromInput.addEventListener(this.event, this.switchTimeSelector.bind(this));
            }
            if (this.dateToInput !== null) {
                this.dateToInput.readOnly = true;
                this.dateToInput.addEventListener(this.event, this.switchCalendar.bind(this));
                // Если передат элемент, хранящий время, то считаем, что пользователь будет еще отдельно вводить время
                if (this.timeToInput !== null) {
                    this.timeToInput.className = 'calendar-time-input';
                    this.timeToInput.readOnly = true;
                    this.timeToInput.addEventListener(this.event, this.switchTimeSelector.bind(this));
                }
            }
        }
        // Добавляем событие обработки нажатий левой кнопки мыши внутри календаря
        this.dateCalendarContainer.addEventListener('click', this.daysContainerClickListener.bind(this));
        // Добавляем событие обработки нажатий кнопки перемотки месяцев календаря в будущее
        this.leafOverFuture.addEventListener('click', this.leafOverFutureClickHandler.bind(this));
        // Добавляем событие обработки нажатий кнопки перемотки месяцев календаря в прошлое
        this.leafOverPast.addEventListener('click', this.leafOverPastClickHandler.bind(this));
        // Добавляем событие обработки нажатий кнопки с изображением отображаемого в календаре года
        this.yearIndicator.addEventListener('click', this.yearIndicatorClickHandler.bind(this));
        // Добавляем событие обработки нажатий кнопки мыши внутри контейнера выбора годов
        this.yearsContainer.addEventListener('click', this.yearsContainerClickHandler.bind(this));
        // Если доступен выбор диапазона дат, также добавляем обработчик на перемещение мыши - чтобы
        // была подсветка диапазона дат
        if (this.isSelectDaysInRangeAllowed) {
            this.dateCalendarContainer.addEventListener('mouseover', this.calendarMouseOverHandlerWhenRangesAllowed.bind(this));
        } else {
            this.dateCalendarContainer.addEventListener('mouseover', this.calendarMouseOverHandler.bind(this));
            this.dateCalendarContainer.addEventListener('mouseout', this.calendarMouseOutHandler.bind(this));
        }
    };
    /**
     * Обработчик движения курсора мыши над календарем
     * @param {*} e 
     */
    this.calendarMouseOverHandlerWhenRangesAllowed = function (e) {
        let target = e.target;
        let dayContainerNode = target.parentNode;
        if (target.classList.contains('day') && this.dayFromSelected !== null && this.dayToSelected === null) {
            // Конечный год диапазона дат, выделенных цветом
            let newEndYearInRangeByMouseOver = parseInt(dayContainerNode.parentNode.dataset.yearNumber);
            // Конечный месяц диапазона дат, выделенных цветом
            let newEndMonthInRangeByMouseOver = parseInt(dayContainerNode.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let newEndDayInRangeByMouseOver = parseInt(dayContainerNode.dataset.number);
            // Проверяем, не вышли мы при движении мышкой за ращрешенный диапазон выбора дат
            if (dayContainerNode.classList.contains('unactive')) {
                this.updateHighLightedDays(newEndYearInRangeByMouseOver, newEndMonthInRangeByMouseOver, newEndDayInRangeByMouseOver);
                this.endYearInRangeByMouseOver = newEndYearInRangeByMouseOver;
                this.endMonthInRangeByMouseOver = newEndMonthInRangeByMouseOver;
                this.endDayInRangeByMouseOver = newEndDayInRangeByMouseOver;
            }
        }
    };
    /**
     * Обработчик движения курсора мыши над календарем
     * @param {*} e 
     */
    this.calendarMouseOverHandler = function (e) {
        if (e.target.classList.contains('day')) {
            let curDayNode = e.target;
            let curDayNodeCoordinates = curDayNode.getBoundingClientRect();
            let calendarContainerCorrdinates = this.dateCalendarContainer.getBoundingClientRect();
            this.dayUnderCursorFrame.style.top = (curDayNodeCoordinates.top - calendarContainerCorrdinates.top - this.dayNodeWidth) + 'px';
            this.dayUnderCursorFrame.style.left = (curDayNodeCoordinates.left - calendarContainerCorrdinates.left - this.dayNodeWidth) + 'px';
            this.dayUnderCursorFrame.style.display = 'block';
        }
    };

    /**
     * Обработчик выхода курсора мыши с элемента дня календаря
     * @param {*} e 
     */
    this.calendarMouseOutHandler = function (e) {
        if (e.target.classList.contains('day')) {
            if (!e.relatedTarget.classList.contains('day')) {
                this.dayUnderCursorFrame.style.display = 'none';
            }
        }
    };

    /**
     * Обработчик нажатия левой кнопки мыши по дню календаря
     * @param {*} e 
     */
    this.daysContainerClickListener = function (e) {
        let target = e.target;
        let dayContainerNode = target.parentNode;
        if (target.classList.contains('day') && !dayContainerNode.classList.contains('unactive')) {

            // Конечный год диапазона дат, выделенных цветом
            let curYear = parseInt(dayContainerNode.parentNode.dataset.yearNumber);
            // Конечный месяц диапазона дат, выделенных цветом
            let curMonth = parseInt(dayContainerNode.parentNode.dataset.number);
            // Конечная дата диапазона дат, выделенных цветом
            let curDay = parseInt(dayContainerNode.dataset.number);
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
    /**
     * Обновление подсвечиваемого дипазона дат при установленной настройке
     * выбора диапазона дат
     * @param {*} newEnd 
     * @param {*} newMonth 
     * @param {*} newDay 
     */
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
                        this.displayedYearToMonthsArray[year][month][day].node.classList.add('in_selected_period');
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
                        this.displayedYearToMonthsArray[year][month][day].node.classList.remove('in_selected_period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = this.JANUARY;
            }
        }
    };
    /**
     * Удаление подсветки выбранных дат с календаря при установленной настройке выбора диапазона дат
     */
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
                    this.displayedYearToMonthsArray[year][month][day].node.classList.remove('in_selected_period');
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
     * Расчет диапазонов годов, месяцев и дней, в том числе диапазона разрешенных
     * для выбора дат
     */
    this.calculateDayRangesToDisplayInCalendar = function () {
        this.calculateDisplayedYearToMonthsArray();
        // Если передана настройка - Предоставлять выбор дат только из определенного периода относительно текущей даты
        if (this.isLimitPossibleDaysWithRange) {
            this.calculatePossibleDateRange()
        }
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
        this.draw();
    };

    /**
    * Функционал слайдера, в частности для перелистывания месяцев
    * Перелистывание в будущее (вправо)
    */
    this.leafMonthOverInThePast = function (container) {
    };
    /**
     * Создание вспомогательного массива, содержащего отображаемые года и соответствующие им месяцы
     * для отображения в календаре
     */
    this.calculateDisplayedYearToMonthsArray = function () {
        this.displayedYearToMonthsArray = [];
        var curFutureYear = this.curDisplayedYear;
        var curPastYear = this.curDisplayedYear;
        var curFutureMonth = this.curDisplayedMonth;
        var curPastMonth = this.curDisplayedMonth;
        this.displayedYearToMonthsArray[this.curDisplayedYear] = [];
        this.displayedYearToMonthsArray[this.curDisplayedYear][this.curDisplayedMonth] = [];
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
                    this.displayedYearToMonthsArray[curFutureYear] = [];
                } else {
                    curFutureMonth++;
                }
                this.displayedYearToMonthsArray[curFutureYear][curFutureMonth] = [];
                // Если возможный диапазон выбора дат разрешает выбор дат в прошлом
                // и если часть диапазона в прошлом захватывает прошлый год, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curPastMonth == this.JANUARY) {
                    curPastMonth = this.DECEMBER;
                    curPastYear--;
                    this.displayedYearToMonthsArray[curPastYear] = [];
                } else {
                    curPastMonth--;
                }
                this.displayedYearToMonthsArray[curPastYear][curPastMonth] = [];
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
                    this.displayedYearToMonthsArray[curFutureYear] = [];
                } else {
                    curFutureMonth++;
                }
                this.displayedYearToMonthsArray[curFutureYear][curFutureMonth] = [];
            }
        }
    };
    /**
     * Проверка входит ли данная дата, переданная как раздельно год, месяц и день
     * в разрешенный диапазон выбора дат (если такая настройка установлена)
     * @param {*} year 
     * @param {*} month 
     * @param {*} day 
     * @returns 
     */
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
        this.yearsContainer.setAttribute('id', 'years');
        this.yearsContainer.style.display = 'none';
        this.monthsContainer.setAttribute('id', 'months');
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
        this.dateCalendarContainer.appendChild(this.yearsContainer);
        this.dateCalendarContainer.appendChild(this.yearIndicator);
        this.dateCalendarContainer.appendChild(this.monthsContainer);
        document.body.appendChild(this.dateCalendarContainer);
        this.yearIndicator.textContent = this.curDisplayedYear;
        // Теперь заполняем возможный для выбор диапазон годов
        for (let yearInPossibleRange = this.curYear - Math.floor(this.YEARS_RANGE / 2); yearInPossibleRange < this.curYear + Math.floor(this.YEARS_RANGE / 2); yearInPossibleRange++) {
            this.possibleYears.push(yearInPossibleRange);
        }
        // Заполняем секцию выбора возможных годов
        let amountOfPossibleYears = this.possibleYears.length;
        this.possibleYears.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
            yearNode.dataset.number = year;
            yearNode.style.width = (this.amountOfRowsForYears * 100 / amountOfPossibleYears) + '%';
            if (!(year in this.yearNodes)) {
                this.yearNodes.push(yearNode);
            }
            this.yearsContainer.appendChild(yearNode);
        }.bind(this));
        for (let i = 0; i < this.amountOfMonthsToDisplay; i++) {
            let monthHeadingNode = document.createElement('h4');
            monthHeadingNode.className = 'month-heading';
            let monthContainerNode = document.createElement('div');
            monthContainerNode.className = 'month-container';
            monthContainerNode.style.width = 100 / this.amountOfMonthsToDisplay + '%';
            monthContainerNode.appendChild(monthHeadingNode);
            this.appendDaysHeadingsToMonthContainerNode(monthContainerNode);
            this.monthsContainer.appendChild(monthContainerNode);
        }
        this.calculateDayNodeWidth();
        // Создаем рамку вокруг узла в днем
        this.dayUnderCursorFrame = document.createElement('div');
        this.dayUnderCursorFrame.className = 'day-under-cursor-frame';
        this.dayUnderCursorFrame.style.height = 3 * this.dayNodeWidth + 'px';
        this.dayUnderCursorFrame.style.width = 3 * this.dayNodeWidth + 'px';
        this.dateCalendarContainer.appendChild(this.dayUnderCursorFrame);
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
    /**
     * Обработчик нажатия кнопки подтверждения выбора времени в окне выбора времени
     * @param {*} e 
     */
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
    /**
     * Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     * @param {*} e 
     */
    this.leafOverFutureClickHandler = function (e) {
        if (this.curDisplayedMonth == this.DECEMBER) {
            this.curDisplayedMonth = this.JANUARY;
            this.curDisplayedYear++;
        } else {
            this.curDisplayedMonth++;
        }
        this.redraw();
    };
    /**
     *  Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     * @param {*} e 
     */
    this.leafOverPastClickHandler = function (e) {
        if (this.curDisplayedMonth == this.JANUARY) {
            this.curDisplayedMonth = this.DECEMBER;
            this.curDisplayedYear--;
        } else {
            this.curDisplayedMonth--;
        }
        this.redraw();
    };
    /**
     *  Обработчик события нажатий кнопки с изображением отображаемого в календаре года
     * @param {*} e 
     */
    this.yearIndicatorClickHandler = function (e) {
        if (this.isDisplayed(this.yearsContainer)) {
            this.hide(this.yearsContainer);
        } else {
            this.show(this.yearsContainer);
        }
    };
    /**
     *  Обработчик события обработки нажатий кнопки мыши внутри контейнера выбора годов
     * @param {*} e 
     */
    this.yearsContainerClickHandler = function (e) {
        if (e.target.classList.contains('year')) {
            this.curDisplayedYear = e.target.dataset.number;
            this.redraw();
            this.hide(this.yearsContainer);
        }
    }
    /**
     * Проверка, имеется ли месяц с переданным номеров в дереве DOM
     * @param {*} month 
     */
    this.isMonthNodeExistsInDom = function (month) {
        let monthNodes = document.getElementsByClassName('month');
        monthNodes.forEach(function (elem, index) {
            if (elem.dataset.number == month) {
                return true;
            }
        });
        return false;
    };
    /**
     * Получение количества одновременно отображаемых месяцев
     * @returns int
     */
    this.getAmountOfMonthsInDOM = function () {
        return document.getElementsByClassName('month-container').length;
    };
    /**
     * Рассчет ширины HTML элемента, хранящего дату в календаре
     */
    this.calculateDayNodeWidth = function () {
        // Временно создаем и добавляем элемент, содержащий дату, в дерево HTML документа, чтобы вычислить размер в пикселях
        // дабы получить отображение этого элемента в виде квадрата
        let windowWidth = window.innerWidth;
        let calendarContainerWidth = getInnerNodeWidth(this.dateCalendarContainer, windowWidth);
        let monthsContainerWidth = getInnerNodeWidth(this.monthsContainer, calendarContainerWidth);
        let monthContainerWidth = getInnerNodeWidth(this.monthsContainer.getElementsByClassName('month-container')[0], monthsContainerWidth);
        let dayContainerNode = document.createElement('div');
        dayContainerNode.className = 'day-container';
        this.dateCalendarContainer.appendChild(dayContainerNode);
        let dayNodeWidth = parseFloat(window.getComputedStyle(dayContainerNode).width) * monthContainerWidth / 100;
        this.dateCalendarContainer.removeChild(dayContainerNode);
        this.dayNodeWidth = dayNodeWidth;
    };

    /**
     * Инициализация расчета разрешенного периода выбора дат
     */
    this.calculatePossibleDateRange = function () {
        this.startPossibleDay = day - Math.floor(this.possibleDaysRange / 2);
        this.endPossibleDay = day + Math.floor(this.possibleDaysRange / 2);
        var curYear = year;
        var curMonth = month;
        this.startPossibleYear = this.curYear;
        this.endPossibleYear = this.curYear;
        this.startPossibleMonth = this.curMonth;
        this.endPossibleMonth = this.curMonth;
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
    };
    /**
     * Метод формирует заголовко индикатора тгода на основе 
     * рассчитанного массива годов и месяцев для отображения в календаре
     * @returns string
     */
    this.getYearIndicatorBasedOnCalculatedDaysToDisplay = function () {
        let curYear = Object.keys(this.displayedYearToMonthsArray)[0];
        let yearIndicatorValue = curYear;
        this.displayedYearToMonthsArray.forEach(function (value, index) {
            if (curYear != index) {
                curYear = index;
                yearIndicatorValue = yearIndicatorValue + '/' + curYear;
            }
        });
        return yearIndicatorValue;
    };
    /**
     * Поиск DOM элементов по значению опредленного
     * атрибута внутри какого-либо другого DOM-элемента
     * @param {*} parent 
     * @param {*} attribute 
     * @param {*} value 
     * @returns array
     */
    this.getDOMNodesByAttributeValue = function (parent, attribute, value) {
        var foundElements = [];
        var allParentChilds = parent.getElementsByTagName('*');
        for (var i = 0; i < allParentChilds.length; i++) {
            let attributeValue = allParentChilds[i].getAttribute(attribute);
            if (attributeValue !== null && attributeValue == value) {
                foundElements.push(allParentChilds[i]);
            }
        }
        return foundElements;
    };
    /**
     * Поиск DOM элемента по значению опредленного
     * атрибута внутри какого-либо другого DOM-элемента
     * @param {*} parent 
     * @param {*} attribute 
     * @param {*} value 
     * @returns array
     */
    this.getDOMNodeByAttributeValue = function (parent, attribute, value) {
        var allParentChilds = parent.getElementsByTagName('*');
        for (var i = 0; i < allParentChilds.length; i++) {
            let attributeValue = allParentChilds[i].getAttribute(attribute);
            if (attributeValue !== null && attributeValue == value) {
                return allParentChilds[i];
            }
        }
        return null;
    };
    /**
     * Метод добавляет в DOM элемент месяца заголовки дней
     * @param {*} monthContainerNode 
     */
    this.appendDaysHeadingsToMonthContainerNode = function (monthContainerNode) {
        var monthDayHeadingsContainer = document.createElement('div');
        monthDayHeadingsContainer.className = 'month-day-headings';
        for (let i = 0; i < this.DAYS_IN_WEEK; i++) {
            let = monthDayHeading = document.createElement('span');
            monthDayHeading.className = 'month-day-heading';
            monthDayHeading.textContent = this.getDayNameByNumber(i);
            monthDayHeadingsContainer.appendChild(monthDayHeading);
        }
        monthContainerNode.appendChild(monthDayHeadingsContainer);
    }
    /**
     * Метод возвращает краткое текстовое 
     * наименования дня недели по его индексу
     * @param {*} dayNumber 
     * @returns 
     */
    this.getDayNameByNumber = function (dayNumber) {
        return this.dayNames[dayNumber];
    }
}
/**
 * Вспомогательная функция расчета размера элемента 
 * в пикселях на основе декларации размера ширины в пикселах из
 * правила CSS относительно размера ширины его родительского узла
 * @param {*} node 
 * @param {*} parentWidth 
 */
function getInnerNodeWidth(node, parentWidth) {
    let nodeWidth = window.getComputedStyle(node).width;
    if (nodeWidth.indexOf('%') != -1) {
        nodeWidth = parentWidth * parseFloat(nodeWidth) / 100;
    } else if (nodeWidth == 'auto') {
        nodeWidth = parseInt(parentWidth);
    } else {
        nodeWidth = parseInt(nodeWidth);
    }
    if (window.getComputedStyle(node).boxSizing == 'border-box') {
        let nodePaddingLeft = parseFloat(window.getComputedStyle(node).paddingLeft);
        let nodePaddingRight = parseFloat(window.getComputedStyle(node).paddingRight);
        nodeWidth = nodeWidth - (nodePaddingLeft + nodePaddingRight);
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