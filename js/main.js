/**
 * Класс календаря с возиожностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
 */
var Calendar = function (input_id,
    isDateInput = true,
    initiator = null,
    event = 'click',
    possibleDaysRange = 100,
    isSelectTimeWithDateTogetherAllowed = true,
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
    this.isDateInput = isDateInput;
    // HTML узел, который будеит содержат всю разметку календаря
    this.dateCalendarContainer = null;
    this.yearsContainer = null;
    this.monthsContainer = null;
    this.applyDateTimeButton = null;
    this.timeSelectorContainer = null;
    this.hoursContainer = null;
    this.minutesContainer = null;
    this.hoursStartSelector = null;
    this.minutesStartSelector = null;
    this.hoursEndSelector = null;
    this.minutesEndSelector = null;
    this.upHoursStartButton = null;
    this.downHoursStartButton = null;
    this.upMinutesStartButton = null;
    this.downMinutesStartButton = null;
    this.upHoursEndButton = null;
    this.downHoursEndButton = null;
    this.upMinutesEndButton = null;
    this.downMinutesEndButton = null;
    this.applyTimeButton = null;
    this.yearIndicator = null;
    this.leafOverFuture = null;
    this.leafOverPast = null;
    //-------------------------------------------
    // Разрешается ли выбор дат в прошлом
    this.isAllowedDatesInThePast = false;
    // Разрешается ли ввод времени в том же окне, где и выбор даты
    this.isSelectTimeWithDateTogetherAllowed = isSelectTimeWithDateTogetherAllowed;
    //-------------------------------------------
    this.startPossibleYear = null;
    this.endPossibleYear = null;
    this.startPossibleMonth = null;
    this.endPossibleMonth = null;
    this.startPossibleDay = null;
    this.endPossibleDay = null;
    //-------------------------------------------
    this.selectedYearStart = null;
    this.selectedYearEnd = null;
    this.selectedMonthStart = null;
    this.selectedMonthEnd = null;
    this.selectedDayStart = null;
    this.selectedDayEnd = null;
    this.selectedHoursStart = null;
    this.selectedHoursEnd = null;
    this.selectedMinutesStart = null;
    this.selectedMinutesEnd = null;
    //-------------------------------------------
    this.pickedYearStart = null;
    this.pickedYearEnd = null;
    this.pickedMonthStart = null;
    this.pickedMonthEnd = null;
    this.pickedDayStart = null;
    this.pickedDayEnd = null;
    //-------------------------------------------
    this.input = document.getElementById(input_id);
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
    this.dayNodeWidth = 0;
    this.dayNodeHighlightColor = '#bbb';
    this.dayUnderCursorFrame = null;
    // Кнопка закрытия окна календаря
    this.closeCalendarContainerButton = null;
    // Кнопка закрытия окна ввода времени
    this.closeTimeSelectorContainerButton = null;
    // Флаг, сигнализирующий о том, что инициализация календаря была осуществлена
    this.initialized = false;
    /**
   * Определение количества дней в месяце данного года
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
     * Отрисовка или переотрисовка календаря
     */
    this.draw = function () {
        if (this.initialized) {
            this.unHighLightDays();
            this.calculateDayRangesToDisplayInCalendar();
        } else {
            if (!this.input.disabled && !this.input.readOnly) {
                this.input.readOnly = true;
                this.input.style.backgroundColor = 'white';
            } else {
                this.input.style.backgroundColor = '#eeeeee';
            }
            this.createDateCalendarContainer();
            if (!this.isSelectTimeWithDateTogetherAllowed) {
                this.createTimeSelectorContainer();
            }
        }
        this.yearIndicator.textContent = this.getYearIndicatorBasedOnCalculatedDaysToDisplay();
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
            monthsToDisplay.forEach(function (days, monthToDisplay) {
                var date = new Date();
                date.setFullYear(yearToDisplay);
                date.setMonth(monthToDisplay);
                daysCountOfCurMonth = this.getDaysCountOfMonth(yearToDisplay, monthToDisplay);
                let curMonthContainer = this.monthsContainer.getElementsByClassName('month-container')[monthIndex];
                curMonthContainer.dataset.month = monthToDisplay;
                curMonthContainer.dataset.year = yearToDisplay;
                let monthHeadingNode = curMonthContainer.getElementsByClassName('month-heading')[0];
                monthHeadingNode.textContent = this.getMonthName(monthToDisplay);
                for (let dayToDisplay = 1; dayToDisplay <= daysCountOfCurMonth; dayToDisplay++) {
                    date.setDate(dayToDisplay);
                    dayContainerNode = null;
                    if (this.initialized) {
                        dayContainerNode = this.getDOMNodeByAttributeValue(curMonthContainer, 'data-day', dayToDisplay);
                    }
                    // Если текущего дня еще нет в DOM календаря данного года и месяца -
                    // создаем его
                    if (!dayContainerNode) {
                        dayContainerNode = document.createElement('div');
                        dayContainerNode.className = 'day-container';
                        dayNode = document.createElement('span');
                        dayNode.className = 'day';
                        dayContainerNode.dataset.day = dayToDisplay;
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
                    dayOfWeek = date.getDay();
                    dayOfWeek--;
                    if (dayOfWeek < 0) {
                        dayOfWeek = 6;
                    }
                    dayContainerNode.dataset.dayOfWeek = dayOfWeek;
                    isWeekEnd = dayOfWeek == 5 || dayOfWeek == 6;
                    if (dayToDisplay == 1) {
                        dayNodeCSSMargin = (dayOfWeek / 7) * 100;
                        dayContainerNode.style.marginLeft = dayNodeCSSMargin + '%';
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
                    if (this.initialized && this.isSelectTimeWithDateTogetherAllowed) {
                        if (this.pickedYearStart !== null &&
                            this.pickedMonthStart !== null &&
                            this.pickedDayStart !== null) {
                            if (this.pickedYearStart == yearToDisplay &&
                                this.pickedMonthStart == monthToDisplay &&
                                this.pickedDayStart == dayToDisplay) {
                                dayContainerNode.classList.add('selected');
                            }
                        } else if (this.selectedYearStart == yearToDisplay &&
                            this.selectedMonthStart == monthToDisplay &&
                            this.selectedDayStart == dayToDisplay) {
                            dayContainerNode.classList.add('selected');
                        }
                    }
                };
                // Если в текущем месяце меньше 31 дня, то проверяем, возможно есть
                // узлы дней из предыдущего календаря (с предыдущими настройками)
                // со значением больше мксимального номера дня в текущем месяце
                if (this.initialized && daysCountOfCurMonth < this.MAX_DAYS_AMOUNT_IN_MONTH) {
                    let dayContainerNodeToRemove = null;
                    for (let i = daysCountOfCurMonth + 1; i <= this.MAX_DAYS_AMOUNT_IN_MONTH; i++) {
                        dayContainerNodeToRemove = this.getDOMNodeByAttributeValue(curMonthContainer, 'data-day', i);
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
        var initiator = this.initiator;
        let date = new Date();
        this.curYear = date.getFullYear();
        this.curMonth = date.getMonth();
        this.curDay = date.getDate();
        this.curDisplayedYear = this.curYear;
        this.curDisplayedMonth = this.curMonth;
        // Если в полях ввода есть какие-то данные, инициализируем соответствующие свойства класса
        if (this.input !== null && this.input.value.length > 0) {
            if (this.isSelectDaysInRangeAllowed) {
                this.curDisplayedYear = this.selectedYearStart = parseInt(this.input.value.substring(6, 10));
                this.curDisplayedMonth = this.selectedMonthStart = parseInt(this.input.value.substring(3, 5)) - 1;
                this.selectedDayStart = parseInt(this.input.value.substring(0, 2));
                this.selectedHoursStart = parseInt(this.input.value.substring(11, 13));
                this.selectedMinutesStart = parseInt(this.input.value.substring(14, 16));
                this.selectedYearEnd = parseInt(this.input.value.substring(24, 28));
                this.selectedMonthEnd = parseInt(this.input.value.substring(21, 23)) - 1;
                this.selectedDayEnd = parseInt(this.input.value.substring(18, 20));
                this.selectedHoursEnd = parseInt(this.input.value.substring(30, 32));
                this.selectedMinutesEnd = parseInt(this.input.value.substring(33));
            } else if (this.isSelectTimeWithDateTogetherAllowed) {
                this.curDisplayedYear = this.selectedYearStart = parseInt(this.input.value.substring(6, 10));
                this.curDisplayedMonth = this.selectedMonthStart = parseInt(this.input.value.substring(3, 5)) - 1;
                this.selectedDayStart = parseInt(this.input.value.substring(0, 2));
                this.selectedHoursStart = parseInt(this.input.value.substring(11, 13));
                this.selectedMinutesStart = parseInt(this.input.value.substring(14));
            } else {
                this.curDisplayedYear = this.selectedYearStart = parseInt(this.input.value.substring(6));
                this.curDisplayedMonth = this.selectedMonthStart = parseInt(this.input.value.substring(3, 5)) - 1;
                this.selectedDayStart = parseInt(this.input.value.substring(0, 2));
            }
        }
        this.draw();
        // Добавляем события, по которым будут отображаться календарь и окно выбра времени
        // с учетом возможности использовать внешний элемент для отображения календаря, он хранится в свойсте initiator
        if (initiator === null) {
            initiator = this.input;
        }
        // Добавляем события, по которым будут отображаться календарь и окно выбора времени
        if (this.isDateInput) {
            initiator.addEventListener(this.event, this.switchCalendar.bind(this));
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
            this.closeCalendarContainerButton.addEventListener('click', this.closeCalendarContainerButtonClickHandler.bind(this));
        } else {
            initiator.addEventListener(this.event, this.switchTimeSelector.bind(this));
            this.closeTimeSelectorContainerButton.addEventListener('click', this.closeTimeSelectorContainerButtonClickHandler.bind(this));
        }
        this.initialized = true;
    };
    /**
     * Обработчик нажатия на кнопку закрыть календаря
     */
    this.closeCalendarContainerButtonClickHandler = function (e) {
        this.switchCalendar(e);
    };
    /**
     * Обработчик нажатия на кнопку закрыть окна выбора времени
     */
    this.closeTimeSelectorContainerButtonClickHandler = function (e) {
        this.switchTimeSelector(e);
    };
    /**
     * Обработчик движения курсора мыши над календарем
     */
    this.calendarMouseOverHandlerWhenRangesAllowed = function (e) {
        let target = e.target;
        let dayContainerNode = target.parentNode;
        if (target.classList.contains('day') && this.selectedDayStart !== null && this.selectedDayEnd === null) {
            // Конечный год диапазона дат, выделенных цветом
            let newEndYearInRangeByMouseOver = parseInt(dayContainerNode.parentNode.dataset.year);
            // Конечный месяц диапазона дат, выделенных цветом
            let newEndMonthInRangeByMouseOver = parseInt(dayContainerNode.parentNode.dataset.month);
            // Конечная дата диапазона дат, выделенных цветом
            let newEndDayInRangeByMouseOver = parseInt(dayContainerNode.dataset.day);
            // Проверяем, не вышли мы при движении мышкой за ращрешенный диапазон выбора дат
            if (dayContainerNode.classList.contains('unactive')) {
                this.updateHighLightedDaysInRange(newEndYearInRangeByMouseOver, newEndMonthInRangeByMouseOver, newEndDayInRangeByMouseOver);
                this.endYearInRangeByMouseOver = newEndYearInRangeByMouseOver;
                this.endMonthInRangeByMouseOver = newEndMonthInRangeByMouseOver;
                this.endDayInRangeByMouseOver = newEndDayInRangeByMouseOver;
            }
        }
    };
    /**
     * Обработчик движения курсора мыши над календарем
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
     */
    this.daysContainerClickListener = function (e) {
        let target = e.target;
        let dayContainerNode = target.parentNode;
        if (target.classList.contains('day') && !dayContainerNode.classList.contains('unactive')) {
            dayContainerNode.classList.add('selected');
            // Снимаем подсветку выбранной даты с предыдущего раза,
            // если установлена опция выбора даты и времени в одном и том же окне
            this.unHighLightDays();
            // Конечный год диапазона дат, выделенных цветом
            let curYear = parseInt(dayContainerNode.parentNode.dataset.year);
            // Конечный месяц диапазона дат, выделенных цветом
            let curMonth = parseInt(dayContainerNode.parentNode.dataset.month);
            // Конечная дата диапазона дат, выделенных цветом
            let curDay = parseInt(dayContainerNode.dataset.day);
            if (this.isSelectDaysInRangeAllowed) {
                if (this.selectedDayStart !== null && this.selectedDayEnd !== null) {
                    this.unHighLightDaysInRange();
                    this.clearInput();
                }
                if (this.selectedDayStart !== null && this.selectedDayEnd === null) {
                    // Если новый выделенный период находится внутри предыдущего,
                    // то есть нам нужно убрать подсветку с "хвостика" в конце периода дат
                    if ((this.selectedYearStart <= curYear &&
                        (this.selectedMonthStart <= curMonth || (this.selectedMonthStart > curMonth && this.selectedYearStart < curYear)) &&
                        (this.selectedDayStart <= curDay || (this.selectedDayStart > curDay && this.selectedMonthStart < curMonth)))) {
                        this.updateDateEnd(curYear, curMonth, curDay, !this.isSelectTimeWithDateTogetherAllowed);
                    } else {
                        this.updateDateStart(curYear, curMonth, curDay, !this.isSelectTimeWithDateTogetherAllowed);
                    }
                }
                else {
                    this.updateDateStart(curYear, curMonth, curDay, !this.isSelectTimeWithDateTogetherAllowed);
                }
            } else {
                // В зависимости от того, какое поле ввода даты было источников события -
                // вызываем соответствующий метод
                this.updateDateStart(curYear, curMonth, curDay, !this.isSelectTimeWithDateTogetherAllowed);
                if (!this.isSelectTimeWithDateTogetherAllowed) {
                    this.switchCalendar(e);
                }
            }
        }
    };
    /**
     * Обновление подсвечиваемого дипазона дат при установленной настройке
     * выбора диапазона дат
     */
    this.updateHighLightedDaysInRange = function (newEnd, newMonth, newDay) {
        if ((this.endYearInRangeByMouseOver === null || this.endMonthInRangeByMouseOver === null || this.endDayInRangeByMouseOver === null) ||
            (this.endYearInRangeByMouseOver <= newEnd &&
                (this.endMonthInRangeByMouseOver <= newMonth || (this.endMonthInRangeByMouseOver > newMonth && this.endYearInRangeByMouseOver < newEnd)) &&
                (this.endDayInRangeByMouseOver <= newDay || (this.endDayInRangeByMouseOver > newDay && this.endMonthInRangeByMouseOver < newMonth)))) {
            var startMonthInCurIteration = this.selectedMonthStart;
            var startDayInCurIteration = this.selectedDayStart;
            for (let year = this.selectedYearStart; year <= newEnd; year++) {
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
    this.unHighLightDaysInRange = function () {
        if (this.selectedYearStart !== null && this.selectedMonthStart !== null && this.selectedDayStart !== null &&
            this.selectedYearEnd !== null && this.selectedMonthEnd !== null && this.selectedDayEnd !== null) {
            var startMonthInCurIteration = this.selectedMonthStart;
            var startDayInCurIteration = this.selectedDayStart;
            for (let year = this.selectedYearStart; year <= this.selectedYearEnd; year++) {
                var endMonthInCurIteration = null;
                if (year < this.selectedYearEnd) {
                    endMonthInCurIteration = this.DECEMBER;
                } else {
                    endMonthInCurIteration = this.selectedMonthEnd;
                }
                for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                    var endDayInCurIteration = 0;
                    if (month < this.selectedMonthEnd) {
                        endDayInCurIteration = this.getDaysCountOfMonth(year, month);
                    } else {
                        endDayInCurIteration = this.selectedDayEnd;
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
     * Обновление текущей введенной даты начала периода
     */
    this.updatePickedDateStart = function (year, month, day) {
        this.pickedYearStart = year;
        this.pickedMonthStart = month;
        this.pickedDayStart = day;
    };

    /**
     * Обновление текущей введенной даты окончания периода 
     */
    this.updatePickedDateEnd = function (year, month, day) {
        this.pickedYearEnd = year;
        this.pickedMonthEnd = month;
        this.pickedDayEnd = day;
    };
    /**
     * Обновление текущей выбранной даты начала периода
     */
    this.updateSelectedDateStart = function (year, month, day) {
        if (year !== null && month !== null && day !== null) {
            this.selectedYearStart = year;
            this.selectedMonthStart = month;
            this.selectedDayStart = day;
        }
    };

    /**
     * Обновление текущей выбранной даты окончания периода
     */
    this.updateSelectedDateEnd = function (year, month, day) {
        if (year !== null && month !== null && day !== null) {
            this.selectedYearEnd = year;
            this.selectedMonthEnd = month;
            this.selectedDayEnd = day;
        }
    };
    /**
     * Обновление текущей даты начала периода
     */
    this.updateDateStart = function (year, month, day, isUpdateInput = true) {
        if (isUpdateInput) {
            this.updateSelectedDateStart(year, month, day);
            let date = new Date(this.selectedYearStart, this.selectedMonthStart, this.selectedDayStart);
            let tempArray = this.input.value.split('');
            tempArray.splice(0, 10, date.toLocaleDateString().slice(0, 10));
            this.updateInputValue(tempArray.join(''));
        } else {
            if (this.isSelectTimeWithDateTogetherAllowed) {
                this.pickedYearStart = year;
                this.pickedMonthStart = month;
                this.pickedDayStart = day;
            } else {
                this.updateSelectedDateStart(year, month, day);
            }
        }
    }
    /**
     * Обновление текущей даты окончания периода
     */
    this.updateDateEnd = function (year, month, day, isUpdateInput = true) {
        if (isUpdateInput) {
            this.updateSelectedDateEnd(year, month, day);
            let date = new Date(this.selectedYearStart, this.selectedMonthStart, this.selectedDayStart);
            let dateString = date.toLocaleDateString().slice(0, 10);
            let tempArray = this.input.value.split('');
            if (this.isSelectTimeWithDateTogetherAllowed) {
                tempArray.splice(19, 29, dateString);
            } else {
                tempArray.splice(13, 23, dateString);
            }
            this.updateInputValue(tempArray.join(''));
        }
    }
    /**
     * Обновление текущего вреени начала периода
     */
    this.updateTimeStart = function (hours, minutes) {
        this.selectedHoursStart = parseInt(hours);
        this.selectedMinutesStart = parseInt(minutes);
        if (this.isSelectTimeWithDateTogetherAllowed) {
            let tempArray = this.input.value.split('');
            tempArray.splice(11, 17, hours + ':' + minutes);
            this.updateInputValue(tempArray.join(''));
        } else {
            this.updateInputValue(hours + ':' + minutes);
        }
    }
    /**
     * Обновление текущего вреени начала периода
     */
    this.updateTimeEnd = function (hours, minutes, isUpdateWithInput = false) {
        this.selectedHoursEnd = parseInt(hours);
        this.selectedMinutesEnd = parseInt(minutes);
        if (isUpdateWithInput) {
            let tempArray = this.input.value.split('');
            if (this.isSelectTimeWithDateTogetherAllowed) {
                tempArray.splice(31, 37, hours + ':' + minutes);
            } else {
                tempArray.splice(8, 14, hours + ':' + minutes);
            }
            this.updateInputValue(tempArray.join(''));
        }
    }

    /**
    * Очистка даты и времени конца выбранного периода
    */
    this.clearInput = function () {
        this.input.value = '';
        this.selectedDayStart = this.selectedMonthStart = this.selectedYearStart = null;
        if (this.isSelectTimeWithDateTogetherAllowed) {
            this.selectedHoursStart = this.selectedMinutesStart = null;
        }
        if (this.isSelectDaysInRangeAllowed) {
            this.selectedDayEnd = this.selectedMonthEnd = this.selectedYearEnd = null;
            if (this.isSelectTimeWithDateTogetherAllowed) {
                this.selectedHoursEnd = this.selectedMinutesEnd = null;
            }
        }
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
        if (!this.isDisplayed(this.dateCalendarContainer)) {
            let eventSource = e.target;
            let eventSourceCoorinates = eventSource.getBoundingClientRect();
            this.dateCalendarContainer.style.top = eventSourceCoorinates.bottom + window.scrollY + 'px';
            this.dateCalendarContainer.style.left = eventSourceCoorinates.left + window.scrollX + 'px';
            if (this.initialized) {
                this.draw();
            }
            this.highLightDays();
            this.show(this.dateCalendarContainer)
        } else {
            this.unHighLightDays();
            this.pickedDayStart = this.pickedMonthStart = this.pickedYearStart = null;
            if (this.isDateInPossibleRange) {
                this.pickedDayEnd = this.pickedMonthEnd = this.pickedYearEnd = null;
            }
            this.curDisplayedYear = this.selectedYearStart;
            this.curDisplayedMonth = this.selectedMonthStart;
            this.yearIndicator.textContent = this.selectedYearStart;
            if (this.isDisplayed(this.yearsContainer)) {
                this.hide(this.yearsContainer)
            }
            this.hide(this.dateCalendarContainer);
        }
    };

    /**
     * Переключение окна выбора времени из видимого состояния в невидимое или наоборот
     */
    this.switchTimeSelector = function (e) {
        if (!this.isDisplayed(this.timeSelectorContainer)) {
            let eventSource = e.target;
            this.selectTimeEventSource = eventSource;
            let eventSourceCoorinates = eventSource.getBoundingClientRect();
            this.timeSelectorContainer.style.top = eventSourceCoorinates.bottom + window.scrollY + 'px';
            this.timeSelectorContainer.style.left = eventSourceCoorinates.left + window.scrollX + 'px';
            if (this.initialized) {

            }
            this.show(this.timeSelectorContainer)
        } else {
            this.hide(this.timeSelectorContainer);
        }
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
        this.dateCalendarContainer.className = 'calendar';
        this.dateCalendarContainer.style.display = 'none';
        this.yearsContainer = document.createElement('div');
        this.monthsContainer = document.createElement('div');
        this.yearsContainer.setAttribute('class', 'years');
        this.yearsContainer.style.display = 'none';
        this.monthsContainer.setAttribute('class', 'months');
        this.yearIndicator = document.createElement('p');
        this.yearIndicator.setAttribute('class', 'year-indicator');
        this.leafOverFuture = document.createElement('span');
        this.leafOverFuture.setAttribute('class', 'leaf-over-future');
        this.leafOverFuture.textContent = '>';
        this.leafOverPast = document.createElement('span');
        this.leafOverPast.setAttribute('class', 'leaf-over-past');
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
            yearNode.dataset.year = year;
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
        this.closeCalendarContainerButton = document.createElement('span');
        this.closeCalendarContainerButton.className = 'close-button';
        this.closeCalendarContainerButton.innerHTML = '&#10006;';
        this.dateCalendarContainer.appendChild(this.closeCalendarContainerButton);
        if (this.isSelectTimeWithDateTogetherAllowed) {
            this.createTimeSelectorContainer();
            this.dateCalendarContainer.appendChild(this.timeSelectorContainer);
            this.applyDateTimeButton = document.createElement('button');
            this.applyDateTimeButton.className = 'apply-date-time-button';
            this.applyDateTimeButton.textContent = 'Выбрать';
            this.applyDateTimeButton.addEventListener('click', this.applyDateTimeButtonClickListener.bind(this));
            this.dateCalendarContainer.appendChild(this.applyDateTimeButton);
        }
    };
    /**
     * Создание верстки окна выбора времени
     */
    this.createTimeSelectorContainer = function () {
        this.timeSelectorContainer = document.createElement('div');
        this.timeSelectorContainer.className = 'time-selector';
        if (!this.isSelectTimeWithDateTogetherAllowed) {
            this.timeSelectorContainer.style.display = 'none';
        } else {
            this.timeSelectorContainer.style.position = 'static';
            this.timeSelectorContainer.style.width = '100%';
        }
        //-------------------------------------------------------------
        this.upHoursStartButton = document.createElement('span');
        this.downHoursStartButton = document.createElement('span');
        this.upMinutesStartButton = document.createElement('span');
        this.downMinutesStartButton = document.createElement('span');
        this.upHoursStartButton.className = 'up-button';
        this.downHoursStartButton.className = 'down-button';
        this.upMinutesStartButton.className = 'up-button';
        this.downMinutesStartButton.className = 'down-button';
        this.upHoursStartButton.textContent = '+';
        this.downHoursStartButton.textContent = '-';
        this.upMinutesStartButton.textContent = '+';
        this.downMinutesStartButton.textContent = '-';
        this.upHoursStartButton.addEventListener('click', this.upHoursButtonClickHandler.bind(this));
        this.downHoursStartButton.addEventListener('click', this.downHoursButtonClickHandler.bind(this));
        this.upMinutesStartButton.addEventListener('click', this.upMinutesButtonClickHandler.bind(this));
        this.downMinutesStartButton.addEventListener('click', this.downMinutesButtonClickHandler.bind(this));
        //-------------------------------------------------------------
        this.hoursContainer = document.createElement('div');
        this.hoursContainer.setAttribute('class', 'hours-container');
        this.timeSelectorContainer.appendChild(this.hoursContainer);
        var hoursStartSelectorlabel = document.createElement('label');
        hoursStartSelectorlabel.textContent = 'Час:';
        hoursStartSelectorlabel.setAttribute('for', 'hours-selector');
        this.hoursContainer.appendChild(hoursStartSelectorlabel);
        this.hoursContainer.appendChild(this.upHoursStartButton);
        this.hoursStartSelector = document.createElement('input');
        this.hoursStartSelector.type = 'text';
        this.hoursStartSelector.setAttribute('class', 'hours-selector');
        this.hoursStartSelector.addEventListener('keydown', this.keyDownHoursSelectorHandler.bind(this));
        this.hoursContainer.appendChild(this.hoursStartSelector);
        this.hoursContainer.appendChild(this.downHoursStartButton);
        this.minutesContainer = document.createElement('div');
        this.minutesContainer.setAttribute('class', 'minutes-container');
        this.timeSelectorContainer.appendChild(this.minutesContainer);
        var minutesStartSelectorlabel = document.createElement('label');
        minutesStartSelectorlabel.textContent = 'Минуты:';
        minutesStartSelectorlabel.setAttribute('for', 'minutes-selector');
        this.minutesContainer.appendChild(minutesStartSelectorlabel);
        this.minutesContainer.appendChild(this.upMinutesStartButton);
        this.minutesStartSelector = document.createElement('input');
        this.minutesStartSelector.type = 'text';
        this.minutesStartSelector.setAttribute('class', 'minutes-selector');
        this.minutesStartSelector.addEventListener('keydown', this.keyDownMinutesSelectorHandler.bind(this));
        this.minutesContainer.appendChild(this.minutesStartSelector);
        this.minutesContainer.appendChild(this.downMinutesStartButton);
        if (this.isSelectDaysInRangeAllowed && this.isSelectTimeWithDateTogetherAllowed) {
            //-------------------------------------------------------------
            this.upHoursEndButton = document.createElement('span');
            this.downHoursEndButton = document.createElement('span');
            this.upMinutesEndButton = document.createElement('span');
            this.downMinutesEndButton = document.createElement('span');
            this.upHoursEndButton.className = 'up-button';
            this.downHoursEndButton.className = 'down-button';
            this.upMinutesEndButton.className = 'up-button';
            this.downMinutesEndButton.className = 'down-button';
            this.upHoursEndButton.textContent = '+';
            this.downHoursEndButton.textContent = '-';
            this.upMinutesEndButton.textContent = '+';
            this.downMinutesEndButton.textContent = '-';
            this.upHoursEndButton.addEventListener('click', this.upHoursButtonClickHandler.bind(this));
            this.downHoursEndButton.addEventListener('click', this.downHoursButtonClickHandler.bind(this));
            this.upMinutesEndButton.addEventListener('click', this.upMinutesButtonClickHandler.bind(this));
            this.downMinutesEndButton.addEventListener('click', this.downMinutesButtonClickHandler.bind(this));
            //-------------------------------------------------------------
            var hoursEndSelectorlabel = document.createElement('label');
            hoursEndSelectorlabel.textContent = 'Час:';
            hoursEndSelectorlabel.setAttribute('for', 'hours-selector');
            this.hoursContainer.appendChild(hoursEndSelectorlabel);
            this.hoursContainer.appendChild(this.upHoursEndButton);
            this.hoursEndSelector = document.createElement('input');
            this.hoursEndSelector.type = 'text';
            this.hoursEndSelector.setAttribute('class', 'hours-selector');
            this.hoursEndSelector.addEventListener('keydown', this.keyDownHoursSelectorHandler.bind(this));
            this.hoursContainer.appendChild(this.hoursEndSelector);
            this.hoursContainer.appendChild(this.downHoursEndButton);
            var minutesEndSelectorlabel = document.createElement('label');
            minutesEndSelectorlabel.textContent = 'Минуты:';
            minutesEndSelectorlabel.setAttribute('for', 'minutes-selector');
            this.minutesContainer.appendChild(minutesEndSelectorlabel);
            this.minutesContainer.appendChild(this.upMinutesEndButton);
            this.minutesEndSelector = document.createElement('input');
            this.minutesEndSelector.type = 'text';
            this.minutesEndSelector.setAttribute('class', 'minutes-selector');
            this.minutesEndSelector.addEventListener('keydown', this.keyDownMinutesSelectorHandler.bind(this));
            this.minutesContainer.appendChild(this.minutesEndSelector);
            this.minutesContainer.appendChild(this.downMinutesEndButton);
        }
        if (!this.isSelectTimeWithDateTogetherAllowed) {
            this.applyTimeButton = document.createElement('button');
            this.applyTimeButton.setAttribute('class', 'apply-time-button');
            this.applyTimeButton.textContent = 'Выбрать';
            this.timeSelectorContainer.appendChild(this.applyTimeButton);
            this.applyTimeButton.addEventListener('click', this.applyTimeButtonClickListener.bind(this));
            this.closeTimeSelectorContainerButton = document.createElement('span');
            this.closeTimeSelectorContainerButton.className = 'close-button';
            this.closeTimeSelectorContainerButton.innerHTML = '&#10006;';
            this.dateCalendarContainer.appendChild(this.closeTimeSelectorContainerButton);
            document.body.appendChild(this.timeSelectorContainer);
        }
    };
    /**
     * Обработчик нажатия кнопки подтверждения выбора времени в окне выбора времени
     */
    this.applyTimeButtonClickListener = function (e) {
        if (this.hoursStartSelector.value.length > 0 && this.minutesStartSelector.value.length > 0) {
            this.updateTimeStart(this.hoursStartSelector.value, this.minutesStartSelector.value);
            this.hoursStartSelector.value = '';
            this.minutesStartSelector.value = '';
        }
        if (!this.isSelectTimeWithDateTogetherAllowed) {
            this.switchTimeSelector(e);
        }
    }
    /**
     * Обработчик нажатия кнопки подтверждения выбора даты и времени в окне выбора времени
     */
    this.applyDateTimeButtonClickListener = function (e) {
        if (this.isSelectDaysInRangeAllowed) {
            this.updateDateStart(this.pickedYearStart, this.pickedMonthStart, this.pickedDayStart);
            this.updateDateEnd(this.pickedYearEnd, this.pickedMonthEnd, this.pickedDayEnd);
            if (this.isSelectTimeWithDateTogetherAllowed) {
                this.updateTimeStart(this.hoursStartSelector.value, this.minutesStartSelector.value);
                this.updateTimeEnd(this.hoursEndSelector.value, this.minutesEndSelector.value);
            }
        } else {
            this.updateDateStart(this.pickedYearStart, this.pickedMonthStart, this.pickedDayStart);
            if (this.isSelectTimeWithDateTogetherAllowed) {
                this.updateTimeStart(this.hoursStartSelector.value, this.minutesStartSelector.value);
            }
        }
        this.switchCalendar(e);
    }
    /**
     * Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     */
    this.leafOverFutureClickHandler = function (e) {
        if (this.curDisplayedMonth == this.DECEMBER) {
            this.curDisplayedMonth = this.JANUARY;
            this.curDisplayedYear++;
        } else {
            this.curDisplayedMonth++;
        }
        this.draw();
    };
    /**
     *  Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     */
    this.leafOverPastClickHandler = function (e) {
        if (this.curDisplayedMonth == this.JANUARY) {
            this.curDisplayedMonth = this.DECEMBER;
            this.curDisplayedYear--;
        } else {
            this.curDisplayedMonth--;
        }
        this.draw();
    };
    /**
     *  Обработчик события нажатий кнопки с изображением отображаемого в календаре года
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
     */
    this.yearsContainerClickHandler = function (e) {
        if (e.target.classList.contains('year')) {
            this.curDisplayedYear = e.target.dataset.year;
            this.draw();
            this.hide(this.yearsContainer);
        }
    }

    /**
     * Проверка, имеется ли месяц с переданным номеров в дереве DOM
     */
    this.isMonthNodeExistsInDom = function (month) {
        let monthContainerNodes = this.monthsContainer.getElementsByClassName('monmonth-containerth');
        monthContainerNodes.forEach(function (elem, index) {
            if (elem.dataset.month == month) {
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
        return this.monthsContainer.getElementsByClassName('month-container').length;
    };

    /**
     * Рассчет ширины HTML элемента, хранящего дату в календаре
     */
    this.calculateDayNodeWidth = function () {
        // Временно создаем и добавляем элемент, содержащий дату, в дерево HTML документа, чтобы вычислить размер в пикселях
        // дабы получить отображение этого элемента в виде квадрата
        let bodyClientWidth = document.body.clientWidth;
        let calendarContainerWidth = getInnerNodeWidth(this.dateCalendarContainer, bodyClientWidth);
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
     * @returns 
     */
    this.getDayNameByNumber = function (dayNumber) {
        return this.dayNames[dayNumber];
    }

    /**
     * Снимаем подсветку выбранной даты с предыдущего раза,
     * если установлена опция выбора даты и времени в одном и том же окне
     */
    this.unHighLightSelectedDay = function () {
        if (this.isSelectTimeWithDateTogetherAllowed) {
            var highLightedMonth = null;
            var highLightedDay = null;
            if (this.pickedMonthStart !== null) {
                highLightedMonth = this.pickedMonthStart;
            } else if (this.selectedMonthStart !== null) {
                highLightedMonth = this.selectedMonthStart;
            }
            if (this.pickedDayStart !== null) {
                highLightedDay = this.pickedDayStart;
            } else if (this.selectedDayStart !== null) {
                highLightedDay = this.selectedDayStart;
            }
            if (highLightedMonth !== null && highLightedDay !== null) {
                let previousSelectedMonthContainerNode = this.getDOMNodeByAttributeValue(this.monthsContainer, 'data-month', highLightedMonth);
                if (previousSelectedMonthContainerNode) {
                    let previousSelectedDayContainerNode = this.getDOMNodeByAttributeValue(previousSelectedMonthContainerNode, 'data-day', highLightedDay);
                    if (previousSelectedDayContainerNode) {
                        previousSelectedDayContainerNode.classList.remove('selected');
                    }
                }
            }
            if (this.isSelectDaysInRangeAllowed) {
                if (this.pickedMonthEnd !== null) {
                    highLightedMonth = this.pickedMonthEnd;
                } else if (this.selectedMonthEnd !== null) {
                    highLightedMonth = this.selectedMonthEnd;
                }
                if (this.pickedDayEnd !== null) {
                    highLightedDay = this.pickedDayEnd;
                } else if (this.selectedDayEnd !== null) {
                    highLightedDay = this.selectedDayEnd;
                }
                if (highLightedMonth !== null && highLightedDay !== null) {
                    let previousSelectedMonthContainerNode = this.getDOMNodeByAttributeValue(this.monthsContainer, 'data-month', highLightedMonth);
                    if (previousSelectedMonthContainerNode) {
                        let previousSelectedDayContainerNode = this.getDOMNodeByAttributeValue(previousSelectedMonthContainerNode, 'data-day', highLightedDay);
                        if (previousSelectedDayContainerNode) {
                            previousSelectedDayContainerNode.classList.remove('selected');
                        }
                    }
                }
            }
        }
    };

    /**
     * Подсветка в календаре выбранного дня соответствующего типа
     */
    this.highLightDays = function () {
        if (this.isSelectDaysInRangeAllowed) {

        } else {
            let monthContainerNodesWithSameYear = null;
            let dayContainerNode = null;

            if (this.selectedYearStart !== null &&
                this.selectedMonthStart !== null &&
                this.selectedDayStart !== null) {
                monthContainerNodesWithSameYear = this.getDOMNodesByAttributeValue(this.monthsContainer, 'data-year', this.selectedYearStart);
                for (let i = 0; i < monthContainerNodesWithSameYear.length; i++) {
                    if (monthContainerNodesWithSameYear[i].dataset.month == this.selectedMonthStart) {
                        dayContainerNode = this.getDOMNodeByAttributeValue(monthContainerNodesWithSameYear[i], 'data-day', this.selectedDayStart);
                        if (dayContainerNode) {
                            dayContainerNode.classList.add('selected');
                        }
                    }
                }
                if (this.selectedHoursStart !== null && this.selectedMinutesStart !== null) {
                    this.hoursStartSelector.value = this.selectedHoursStart;
                    if (this.hoursStartSelector.value.length == 1) {
                        this.hoursStartSelector.value = '0' + this.hoursStartSelector.value;
                    }
                    this.minutesStartSelector.value = this.selectedMinutesStart;
                    if (this.minutesStartSelector.value.length == 1) {
                        this.minutesStartSelector.value = '0' + this.minutesStartSelector.value;
                    }
                }
            }
            if (this.isSelectDaysInRangeAllowed) {
                if (this.selectedYearEnd !== null &&
                    this.selectedMonthEnd !== null &&
                    this.selectedDayEnd !== null) {
                    monthContainerNodesWithSameYear = this.getDOMNodesByAttributeValue(this.monthsContainer, 'data-year', this.selectedYearEnd);
                    for (let i = 0; i < monthContainerNodesWithSameYear.length; i++) {
                        if (monthContainerNodesWithSameYear[i].dataset.month == this.selectedMonthEnd) {
                            dayContainerNode = this.getDOMNodeByAttributeValue(monthContainerNodesWithSameYear[i], 'data-day', this.selectedDayEnd);
                            if (dayContainerNode) {
                                dayContainerNode.classList.add('selected');
                            }
                        }
                    }
                    if (this.selectedHoursEnd !== null && this.selectedMinutesEnd !== null) {
                        this.hoursStartSelector.value = this.selectedHoursEnd;
                        if (this.hoursStartSelector.value.length == 1) {
                            this.hoursStartSelector.value = '0' + this.hoursStartSelector.value;
                        }
                        this.minutesStartSelector.value = this.selectedMinutesEnd;
                        if (this.minutesStartSelector.value.length == 1) {
                            this.minutesStartSelector.value = '0' + this.minutesStartSelector.value;
                        }
                    }
                }
            }
        }
    };
    /**
     * Снятие подсветки выбранных дней со всего календаря
     */
    this.unHighLightDays = function (e) {
        if (this.isSelectDaysInRangeAllowed) {
            this.unHighLightDaysInRange();
        } else {
            this.unHighLightSelectedDay();
        }
    };
    /**
     * Обработчик нажатия кнопки увеличения часов
     */
    this.upHoursButtonClickHandler = function (e) {
        if (this.hoursStartSelector.value < 23) {
            if (this.hoursStartSelector.value.length === 0) {
                this.hoursStartSelector.value = 1;
            } else {
                this.hoursStartSelector.value = parseInt(this.hoursStartSelector.value) + 1;
            }
            if (this.hoursStartSelector.value.length == 1) {
                this.hoursStartSelector.value = '0' + this.hoursStartSelector.value;
            }
        }
    };
    /**
     * Обработчик нажатия кнопки уменьшения часов
     */
    this.downHoursButtonClickHandler = function (e) {
        if (this.hoursStartSelector.value > 0) {
            this.hoursStartSelector.value = parseInt(this.hoursStartSelector.value) - 1;
        }
        if (this.hoursStartSelector.value.length == 1) {
            this.hoursStartSelector.value = '0' + this.hoursStartSelector.value;
        }
    };
    /**
     * Обработчик нажатия кнопки увеличения минут
     */
    this.upMinutesButtonClickHandler = function (e) {
        if (this.minutesStartSelector.value < 59) {
            if (this.minutesStartSelector.value.length === 0) {
                this.minutesStartSelector.value = 1;
            } else {
                this.minutesStartSelector.value = parseInt(this.minutesStartSelector.value) + 1;
            }
            if (this.minutesStartSelector.value.length == 1) {
                this.minutesStartSelector.value = '0' + this.minutesStartSelector.value;
            }
        }
    };
    /**
     * Обработчик нажатия кнопки уменьшения минут
     */
    this.downMinutesButtonClickHandler = function (e) {
        if (this.minutesStartSelector.value > 0) {
            this.minutesStartSelector.value = parseInt(this.minutesStartSelector.value) - 1;
        }
        if (this.minutesStartSelector.value.length == 1) {
            this.minutesStartSelector.value = '0' + this.minutesStartSelector.value;
        }
    };
    /**
     * Обработчик нажатия клавиши в поле ввода часов
     */
    this.keyDownHoursSelectorHandler = function (e) {
        if (((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) || e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 37 || e.keyCode == 39) {
            if (e.target.value == '' && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                e.target.value = 0;
            } else if (e.target.value.length == 1 && parseInt(e.target.value + e.key) > 23) {
                e.target.value = 23;
                e.preventDefault();
            } else if (e.target.value.length == 2 && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                if (e.target.value.charAt(0) == '0' && parseInt(e.target.value + e.key) <= 23) {
                    e.target.value = e.target.value.charAt(1) + e.key;
                }
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    };
    /**
     * Обработчик нажатия клавиши в поле ввода минут
     */
    this.keyDownMinutesSelectorHandler = function (e) {
        if (((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) || e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 37 || e.keyCode == 39) {
            if (e.target.value == '' && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                e.target.value = 0;
            } else if (e.target.value.length == 1 && parseInt(e.target.value + e.key) > 59) {
                e.target.value = 59;
                e.preventDefault();
            } else if (e.target.value.length == 2 && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                if (e.target.value.charAt(0) == '0' && parseInt(e.target.value + e.key) <= 59) {
                    e.target.value = e.target.value.charAt(1) + e.key;
                }
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    };
    /**
     * Обновление содержимого поля ввода
     */
    this.updateInputValue = function (value) {
        this.input.value = value;
        var event = new Event('keyup', { bubbles: true });
        this.input.dispatchEvent(event);
    }
}
/**
 * Вспомогательная функция расчета размера элемента 
 * в пикселях на основе декларации размера ширины в пикселах из
 * правила CSS относительно размера ширины его родительского узла
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
        let nodeBorderLeftWidth = parseFloat(window.getComputedStyle(node).borderLeftWidth);
        let nodeBorderRightWidth = parseFloat(window.getComputedStyle(node).borderRightWidth);
        nodeWidth = nodeWidth - (nodePaddingLeft + nodePaddingRight + nodeBorderLeftWidth + nodeBorderRightWidth);
    }
    return nodeWidth;
}