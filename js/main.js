/**
 * Класс календаря с возможностью выбра одной даты, периода, 
* а также настройки диапазона дат, из которого эти даты можно выбрать
*/
// Некоторые часто встречающиеся константы в коде
const JANUARY = 0;
const FEBRUARY = 1;
const AUGUST = 7;
const DECEMBER = 11;
const MAX_DAYS_AMOUNT_IN_MONTH = 31;
const DAYS_IN_WEEK = 7;
// Возможный диапазон выбора годов
const YEARS_RANGE = 48;
class Calendar {
    #input;
    // HTML узел, который будет содержат всю разметку календаря
    _dateCalendarContainer;
    _yearsContainer;
    _monthsContainer;
    _applyDateTimeButton;
    _timeSelectorContainer;
    _hoursContainer;
    _minutesContainer;
    _hoursStartSelector;
    _minutesStartSelector;
    _hoursEndSelector;
    _minutesEndSelector;
    _upHoursStartButton;
    _downHoursStartButton;
    _upMinutesStartButton;
    _downMinutesStartButton;
    _upHoursEndButton;
    _downHoursEndButton;
    _upMinutesEndButton;
    _downMinutesEndButton;
    // Кнопка закрытия окна календаря
    _closeCalendarContainerButton;
    //-------------------------------------------
    _yearIndicator;
    _leafOverFuture;
    _leafOverPast;
    _startPossibleYear;
    _endPossibleYear;
    _startPossibleMonth;
    _endPossibleMonth;
    _startPossibleDay;
    _endPossibleDay;
    // Массив годов, доступных для выбора пользователем
    _possibleYears;
    //-------------------------------------------
    _selectedStartYear;
    _selectedYearStart;
    _selectedStartMonth;
    _selectedEndMonth;
    _selectedStartDay;
    _selectedEndDay;
    _selectedStartHour;
    _selectedEndHour;
    _selectedStartMinute;
    _selectedEndMinutes;
    //-------------------------------------------
    _pickedStartYear;
    _pickedEndYear;
    _pickedStartMonth;
    _pickedEndMonth;
    _pickedStartDay;
    _pickedEndDay;
    //-------------------------------------------
    _endYearInRange;
    _endMonthInRange;
    _endDayInRange;
    //-------------------------------------------
    _curYear;
    _curMonth;
    _displayedYearsToMonths;
    // Массив узлов, содержащих долступные к выбору года
    _yearNodes;
    _dayNodes;
    // Количество отображаемых месяцев в календаре
    _amountOfMonthsToDisplay;
    // Количество рядов элементов, предназначенных для выбора годов
    _amountOfRowsForYears;
    _selectTimeEventSource;
    _dayNodeHighlightColor;
    //-------------------------------------------
    // Массив дней, которые нужно отобразить в браузере 
    // и одновременно это массив дней, доступных для выбора
    // Возможный диапазон выбора дат в днях
    // Это диапазон разобъется пополам и отсчет будеит производиться от текущей даты в будущее и прошлое
    // на количество дней, равное половине этого значения
    _possibleDaysRange;
    // Массив годов, доступных для выбора пользователем
    //  Количество отображаемых месяцев в календаре
    _event;
    // Разрешается ли выбор дат в прошлом
    _isAllowedDatesInThePast;
    // Зависимый от данного календаря узел дерева, 
    // значение в котором должно изменятся согласный функции обратного вызова _dependentNodeCallBack.
    // Путь к этому узлы содержится в аттрибуте calendar-dependent-node-path
    _dependentNode;
    _dependentNodeCallBack;
    //-------------------------------------------
    // Флаг указывающий, что нужно создать календарь с возможностью выбора только внутри ограниченного диапазона
    isLimitPossibleDaysWithRange;
    // Флаг, указывающий, нужно ли пользователю выбирать период, а не просто одну дату
    isPeriodMode;
    // Флаг указывающий, что виджет будет поддерживать возможность выбора дат
    isShowDate;
    // Разрешается ли ввод времени в том же окне, где и выбор даты
    isShowTime;
    queryPath;
    static _dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Суб', 'Вс'];
    static _monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    constructor({ queryPath,
        event = 'click',
        possibleDaysRange = 100,
        isShowDate = true,
        isShowTime = true,
        isPeriodMode = false,
        isLimitPossibleDaysWithRange = false,
        dependentNodeCallBack = null } = {}
    ) {
        this._dayNodeHighlightColor = '#bbb';
        this._isAllowedDatesInThePast = false;
        this._displayedYearsToMonths = [];
        this._possibleYears = [];
        this._dayNodes = [];
        this._yearNodes = [];
        this._amountOfMonthsToDisplay = 3;
        this._amountOfRowsForYears = 4;
        //-------------------------------------------
        this._possibleDaysRange = possibleDaysRange;
        this._event = event;
        this.isPeriodMode = isPeriodMode;
        this.isLimitPossibleDaysWithRange = isLimitPossibleDaysWithRange;
        this.isShowDate = isShowDate;
        this.isShowTime = isShowTime;
        this._dependentNodeCallBack = dependentNodeCallBack;
        this.queryPath = queryPath;
        document.querySelectorAll(this.queryPath).forEach(node => {
            if (!node.disabled && !node.readOnly) {
                node.readOnly = true;
            }
            node.addEventListener(this._event, this.toggle.bind(this));
        });
    }
    /**
     * Определение количества дней в месяце данного года
     */
    static getDaysCountOfMonth(year, month) {
        if (month <= AUGUST) {
            if (month == FEBRUARY) {
                return year % 4 == 0 ? 29 : 28;
            } else if (month == AUGUST) {
                return 31;
            } else {
                return month % 2 == 0 ? 31 : 30;
            }
        } else {
            if (month == DECEMBER) {
                return 31;
            } else {
                return month % 2 == 0 ? 30 : 31;
            }
        }
    };

    /**
     * Определение русского наименования месяца
     */
    static getMonthName(month) {
        return Calendar._monthNames[month];
    };

    /**
     * Метод определения, отображен ли в момент вызова переданный в качестве аргумента контейнер в окне браузере
     */
    isDisplayed(container) {
        return globalThis.getComputedStyle(container).display != 'none';
    };

    /**
     * Начальная отрисовка календаря
    */
    draw(event) {
        this.#input = event.target;
        let curDate = new Date();
        this._curYear = curDate.getFullYear();
        this._curMonth = curDate.getMonth();
        if (this.#input.getAttribute('calendar-dependent-node-path')) {
            this._dependentNode = document.querySelector(this.#input.getAttribute('calendar-dependent-node-path'));
        }
        this._dateCalendarContainer = document.createElement('div');
        this._dateCalendarContainer.className = 'calendar';
        document.body.appendChild(this._dateCalendarContainer);
        this.#initSelectedDateTimeParams();
        if (this.isShowDate) {
            this.#createDateCalendarContainer();
        }
        if (this.isShowTime) {
            this.#createTimeSelectorContainer();
        }
        this._closeCalendarContainerButton = document.createElement('span');
        this._closeCalendarContainerButton.className = 'close-button';
        this._closeCalendarContainerButton.innerHTML = '&#10006;';
        this._dateCalendarContainer.appendChild(this._closeCalendarContainerButton);
        this._closeCalendarContainerButton.addEventListener('click', this.#closeCalendarContainerButtonClickHandler.bind(this));
        if (this.isShowDate) {
            // Добавляем событие обработки нажатий левой кнопки мыши внутри календаря
            this._dateCalendarContainer.addEventListener('click', this.#daysContainerClickListener.bind(this));
            // Добавляем событие обработки нажатий кнопки перемотки месяцев календаря в будущее
            this._leafOverFuture.addEventListener('click', this.#leafOverFutureClickHandler.bind(this));
            // Добавляем событие обработки нажатий кнопки перемотки месяцев календаря в прошлое
            this._leafOverPast.addEventListener('click', this.#leafOverPastClickHandler.bind(this));
            // Добавляем событие обработки нажатий кнопки с изображением отображаемого в календаре года
            this._yearIndicator.addEventListener('click', this.#yearIndicatorClickHandler.bind(this));
            // Добавляем событие обработки нажатий кнопки мыши внутри контейнера выбора годов
            this._yearsContainer.addEventListener('click', this.#yearsContainerClickHandler.bind(this));
            // Если доступен выбор диапазона дат, также добавляем обработчик на перемещение мыши - чтобы
            // была подсветка диапазона дат
            if (this.isPeriodMode) {
                this._dateCalendarContainer.addEventListener('mouseover', this.#mouseOverHandlerWhenRangesAllowed.bind(this));
            } else {
                this._dateCalendarContainer.addEventListener('mouseover', this.#mouseOverCalendarHandler.bind(this));
                this._dateCalendarContainer.addEventListener('mouseout', this.#calendarMouseOutHandler.bind(this));
            }
            this.redrawDays();
        }
        // Добавляем обработчик нажатия мышки вне календарей для их скрытия
        // this._addBodyClickEventHandler();
        let eventSourceCoorinates = this.#input.getBoundingClientRect();
        let dateCalendarContainerCoorinates = this._dateCalendarContainer.getBoundingClientRect();
        if (dateCalendarContainerCoorinates.width + eventSourceCoorinates.left > document.documentElement.clientWidth) {
            this._dateCalendarContainer.style.top = eventSourceCoorinates.bottom + globalThis.scrollY + 'px';
            this._dateCalendarContainer.style.right = 0;
        } else if (dateCalendarContainerCoorinates.height + eventSourceCoorinates.bottom > document.documentElement.clientHeight) {
            this._dateCalendarContainer.style.top = globalThis.scrollY + 'px';
            this._dateCalendarContainer.style.left = eventSourceCoorinates.left + globalThis.scrollX + 'px';
        } else {
            this._dateCalendarContainer.style.top = eventSourceCoorinates.bottom + globalThis.scrollY + 'px';
            this._dateCalendarContainer.style.left = eventSourceCoorinates.left + globalThis.scrollX + 'px';
        }
    };
    /**
     * Перерисовка дней (например, для нового периоды), отображающихся в календаре
     */
    redrawDays() {
        this.unHighLightDays();
        this.#calculateDayRangeToDisplayInCalendar();
        this._yearIndicator.textContent = this.#getYearIndicatorBasedOnCalculatedDaysToDisplay();
        // Заполняем сам календарь днями
        let isInRange = true;
        let dayOfWeek = 0;
        let isWeekEnd = false;
        let dayNodeCSSMargin = 0;
        let daysCountOfCurMonth = 0;
        let monthIndex = 0;
        let dayNode = null;
        for (let [yearToDisplay, monthsToDisplay] of Object.entries(this._displayedYearsToMonths)) {
            for (let monthToDisplay in monthsToDisplay) {
                let date = new Date(yearToDisplay, monthToDisplay, 1);
                daysCountOfCurMonth = Calendar.getDaysCountOfMonth(yearToDisplay, monthToDisplay);
                let curMonthContainer = this._monthsContainer.getElementsByClassName('month-container')[monthIndex];
                curMonthContainer.dataset.month = monthToDisplay;
                curMonthContainer.dataset.year = yearToDisplay;
                let monthHeadingNode = curMonthContainer.getElementsByClassName('month-heading')[0];
                monthHeadingNode.textContent = Calendar.getMonthName(monthToDisplay);
                for (let dayToDisplay = 1; dayToDisplay <= daysCountOfCurMonth; dayToDisplay++) {
                    date.setDate(dayToDisplay);
                    dayNode = this.#getDOMNodeByAttributeValue(curMonthContainer, 'data-day', dayToDisplay);
                    // Если текущего дня еще нет в DOM календаря данного года и месяца -
                    // создаем его
                    if (!dayNode) {
                        dayNode = document.createElement('div');
                        dayNode.className = 'day';
                        dayNode.dataset.day = dayToDisplay;
                        dayNode.textContent = dayToDisplay;
                        curMonthContainer.appendChild(dayNode);
                        dayNode.style.height = getNodeOffsetWidth(dayNode) + 'px';
                        dayNode.style.lineHeight = getNodeContentWidth(dayNode) + 'px';
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
                    dayNode.dataset.dayOfWeek = dayOfWeek;
                    isWeekEnd = dayOfWeek == 5 || dayOfWeek == 6;
                    if (dayToDisplay == 1) {
                        dayNodeCSSMargin = (dayOfWeek / 7) * 100;
                        dayNode.style.marginLeft = dayNodeCSSMargin + '%';
                    }
                    if (isWeekEnd) {
                        if (!dayNode.classList.contains('weekend')) {
                            dayNode.classList.add('weekend');
                        }
                    } else {
                        if (dayNode.classList.contains('weekend')) {
                            dayNode.classList.remove('weekend');
                        }
                    }
                    if (!isInRange) {
                        if (!dayNode.classList.contains('unactive')) {
                            dayNode.classList.add('unactive');
                        }
                    } else {
                        if (dayNode.classList.contains('unactive')) {
                            dayNode.classList.remove('unactive');
                        }
                    }
                    if (this._selectedStartYear == yearToDisplay &&
                        this._selectedStartMonth == monthToDisplay &&
                        this._selectedStartDay == dayToDisplay) {
                        dayNode.classList.add('selected');
                    }
                };
                // Если в текущем месяце меньше 31 дня, то проверяем, возможно есть
                // узлы дней из предыдущего календаря (с предыдущими настройками)
                // со значением больше максимального номера дня в текущем месяце
                if (daysCountOfCurMonth < MAX_DAYS_AMOUNT_IN_MONTH) {
                    let dayNodeToRemove = null;
                    for (let i = daysCountOfCurMonth + 1; i <= MAX_DAYS_AMOUNT_IN_MONTH; i++) {
                        dayNodeToRemove = this.#getDOMNodeByAttributeValue(curMonthContainer, 'data-day', i);
                        if (dayNodeToRemove) {
                            dayNodeToRemove.parentNode.removeChild(dayNodeToRemove);
                        }
                    }
                }
                monthIndex++;
            };
        };
    }

    /**
     * Обработчик нажатия на кнопку закрыть календаря
     */
    #closeCalendarContainerButtonClickHandler(e) {
        this.toggle(e);
    };
    /**
     * Обработчик движения курсора мыши над календарем
     */
    #mouseOverHandlerWhenRangesAllowed(e) {
        let target = e.target;
        let dayContainerNode = target.parentNode;
        if (target.classList.contains('day') && this._selectedStartDay !== null && this._selectedEndDay === null) {
            // Конечный год диапазона дат, выделенных цветом
            let newEndYearInRange = parseInt(dayContainerNode.parentNode.dataset.year);
            // Конечный месяц диапазона дат, выделенных цветом
            let newEndMonthInRange = parseInt(dayContainerNode.parentNode.dataset.month);
            // Конечная дата диапазона дат, выделенных цветом
            let newEndDayInRange = parseInt(dayContainerNode.dataset.day);
            // Проверяем, не вышли мы при движении мышкой за ращрешенный диапазон выбора дат
            if (dayContainerNode.classList.contains('unactive')) {
                this.#updateHighLightedDaysInRange(newEndYearInRange, newEndMonthInRange, newEndDayInRange);
                this._endYearInRange = newEndYearInRange;
                this._endMonthInRange = newEndMonthInRange;
                this._endDayInRange = newEndDayInRange;
            }
        }
    };
    /**
     * Обработчик движения курсора мыши над календарем
     */
    #mouseOverCalendarHandler(event) {
        let target = event.target;
        if (target.classList.contains('day')) {
            target.classList.add('hovered');
        }
    };

    /**
     * Обработчик выхода курсора мыши с элемента дня календаря
     */
    #calendarMouseOutHandler(event) {
        let target = event.target;
        if (target.classList.contains('day')) {
            target.classList.remove('hovered');
        }
    };

    /**
     * Обработчик нажатия левой кнопки мыши по дню календаря
     */
    #daysContainerClickListener(event) {
        let target = event.target;
        if (target.classList.contains('day') && !target.classList.contains('unactive')) {
            // Снимаем подсветку выбранной даты с предыдущего раза
            this.unHighLightDays();
            target.classList.add('selected');
            // Конечный год диапазона дат, выделенных цветом
            let curYear = parseInt(target.parentNode.dataset.year);
            // Конечный месяц диапазона дат, выделенных цветом
            let curMonth = parseInt(target.parentNode.dataset.month);
            // Конечная дата диапазона дат, выделенных цветом
            let curDay = parseInt(target.dataset.day);
            if (!this.isShowTime) {
                if (this.isPeriodMode) {
                    // TODO
                } else {
                    this.updateSelectedDateStart(curYear, curMonth, curDay);
                    this.#updateInputValue();
                }
                this.toggle(event);
            } else {
                if (this.isPeriodMode) {
                    // TODO
                } else {
                    this.#updatePickedDateStart(curYear, curMonth, curDay);
                }
            }
        }
    };
    /**
     * Обновление подсвечиваемого дипазона дат при установленной настройке
     * выбора диапазона дат
     */
    #updateHighLightedDaysInRange(newEnd, newMonth, newDay) {
        if ((this._endYearInRange === null || this._endMonthInRange === null || this._endDayInRange === null) ||
            (this._endYearInRange <= newEnd &&
                (this._endMonthInRange <= newMonth || (this._endMonthInRange > newMonth && this._endYearInRange < newEnd)) &&
                (this._endDayInRange <= newDay || (this._endDayInRange > newDay && this._endMonthInRange < newMonth)))) {
            let startMonthInCurIteration = this._selectedStartMonth;
            let startDayInCurIteration = this._selectedStartDay;
            for (let year = this._selectedStartYear; year <= newEnd; year++) {
                let endMonthInCurIteration = null;
                if (year < newEnd) {
                    endMonthInCurIteration = DECEMBER;
                } else {
                    endMonthInCurIteration = newMonth;
                }
                for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                    let endDayInCurIteration = 0;
                    if (month < newMonth) {
                        endDayInCurIteration = this._getDaysCountOfMonth(year, month);
                    } else {
                        endDayInCurIteration = newDay;
                    }
                    for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                        this._displayedYearsToMonths[year][month][day].node.classList.add('in-selected-period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = JANUARY;
            }
        } else {
            let startMonthInCurIteration = newMonth;
            let startDayInCurIteration = newDay;
            for (let year = newEnd; year <= this._endYearInRange; year++) {
                let endMonthInCurIteration = null;
                if (year < this._endYearInRange) {
                    endMonthInCurIteration = DECEMBER;
                } else {
                    endMonthInCurIteration = this._endMonthInRange;
                }
                for (let month = startMonthInCurIteration; month <= endMonthInCurIteration; month++) {
                    let endDayInCurIteration = 0;
                    if (month < this._endMonthInRange) {
                        endDayInCurIteration = this._getDaysCountOfMonth(year, month);
                    } else {
                        endDayInCurIteration = this._endDayInRange;
                    }
                    for (let day = startDayInCurIteration; day <= endDayInCurIteration; day++) {
                        this._displayedYearsToMonths[year][month][day].node.classList.remove('in-selected-period');
                    }
                    startDayInCurIteration = 1;
                }
                startMonthInCurIteration = JANUARY;
            }
        }
    };

    /**
     * Обновление текущей введенной даты начала периода
     */
    #updatePickedDateStart(year, month, day) {
        this._pickedStartYear = year;
        this._pickedStartMonth = month;
        this._pickedStartDay = day;
    };

    /**
     * Обновление текущей введенной даты окончания периода 
     */
    #updatePickedDateEnd(year, month, day) {
        this._pickedEndYear = year;
        this._pickedEndMonth = month;
        this._pickedEndDay = day;
    };
    /**
     * Обновление текущей выбранной даты начала периода
     */
    updateSelectedDateStart(year, month, day) {
        this._selectedStartYear = year;
        this._selectedStartMonth = month;
        this._selectedStartDay = day;
    };
    /**
 * Обновление текущей выбранного времени начала периода
 */
    updateSelectedTimeStart(hour, minute) {
        this._selectedStartHour = hour;
        this._selectedStartMinute = minute;
    };

    /**
     * Обновление текущей выбранной даты окончания периода
     */
    updateSelectedDateEnd(year, month, day) {
        if (year !== null && month !== null && day !== null) {
            this._selectedYearStart = year;
            this._selectedEndMonth = month;
            this._selectedEndDay = day;
        }
    };
    /**
 *Обновление текущей выбранного времени конца периода
 */
    updateSelectedTimeEnd(hour, minute) {
        this._selectedEndHour = hour;
        this._selectedEndMinute = minute;
    };
    /**
     * Обновление содержимого поля ввода
     */
    #updateInputValue() {
        let value = '';
        let month = '';
        if (this.isShowDate) {
            month = this._selectedStartMonth + 1;
            if (String(month).length == 1) {
                month = '0' + month;
            }
            value += `${this._selectedStartDay}.${month}.${this._selectedStartYear}`;
        }
        if (this.isShowTime) {
            if (this.isShowDate) {
                value += ' ';
            }
            value += `${this._selectedStartHour}:${this._selectedStartMinute}`;
        }
        if (this.isPeriodMode) {
            value += ' - ';
            if (this.isShowDate) {
                month = this._selectedEndMonth + 1;
                if (String(month).length == 1) {
                    month = '0' + month;
                }
                value += `${this._selectedEndDay}.${month}.${this._selectedEndYear}`;
            }
            if (this.isShowTime) {
                if (this.isShowDate) {
                    value += ' ';
                }
                value += `${this._selectedEndHour}:${this._selectedEndMinute}`;
            }
        }
        this.#input.value = value;
        this.#input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    /**
     * Расчет диапазонов годов, месяцев и дней, в том числе диапазона разрешенных
     * для выбора дат
     */
    #calculateDayRangeToDisplayInCalendar() {
        this.#calculateDisplayedYearToMonthsArray();
        // Если передана настройка - Предоставлять выбор дат только из определенного периода относительно текущей даты
        if (this.isLimitPossibleDaysWithRange) {
            this.#calculatePossibleDateRange()
        }
    };

    /**
     * Отображение узла DOM в окне браузера
     */
    hide(container) {
        container.style.display = 'none';
    };

    /**
     *  Скрытие узла DOM в окне браузера
     */
    show(container) {
        container.style.display = 'block';
    };

    /**
     * Удаление узла из дерева DOM
     */
    #removeNode(node) {
        node.parentNode.removeChild(node);
    };
    /**
 * Удаление календаря из дерева DOM
 */
    remove() {
        this.#removeNode(this._dateCalendarContainer);
        this._dateCalendarContainer = null;
        this._selectedStartYear = null;
        this._selectedStartMonth = null;
        this._selectedStartDay = null;
        this._selectedStartHour = null;
        this._selectedStartMinute = null;
        this._selectedEndYear = null;
        this._selectedEndMonth = null;
        this._selectedEndDay = null;
        this._selectedEndHour = null;
        this._selectedEndMinutes = null;
    }
    /**
     * Переключение каледаря из видимого состояния в невидимое или наоборот
     */
    toggle(event) {
        if (!this._dateCalendarContainer) {
            this.draw(event);
        } else {
            this.remove();
        }
        event.stopPropagation();
    };

    /**
     * Создание вспомогательного массива, содержащего отображаемые года и соответствующие им месяцы
     * для отображения в календаре
     */
    #calculateDisplayedYearToMonthsArray() {
        this._displayedYearsToMonths = Object.create(null);
        let curDisplayedYear = this._selectedStartYear ?? this._curYear;
        let curFutureYear = curDisplayedYear;
        let curPastYear = curDisplayedYear;
        let curDisplayedMonth = this._selectedStartMonth ?? this._curMonth;
        let curFutureMonth = curDisplayedMonth;
        let curPastMonth = curDisplayedMonth;
        this._displayedYearsToMonths[curDisplayedYear] = Object.create(null);
        this._displayedYearsToMonths[curDisplayedYear][curDisplayedMonth] = [];
        let endMonthLimitToDisplay = 0;
        if (this._isAllowedDatesInThePast) {
            endMonthLimitToDisplay = this._amountOfMonthsToDisplay / 2;
            for (let monthOffset = 1; monthOffset <= endMonthLimitToDisplay; monthOffset++) {
                // Если возможный диапазон выбора дат 
                // захватывает год в будущем, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curFutureMonth == DECEMBER) {
                    curFutureMonth = JANUARY;
                    curFutureYear++;
                    this._displayedYearsToMonths[curFutureYear] = Object.create(null);
                } else {
                    curFutureMonth++;
                }
                this._displayedYearsToMonths[curFutureYear][curFutureMonth] = [];
                // Если возможный диапазон выбора дат разрешает выбор дат в прошлом
                // и если часть диапазона в прошлом захватывает прошлый год, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curPastMonth == JANUARY) {
                    curPastMonth = DECEMBER;
                    curPastYear--;
                    this._displayedYearsToMonths[curPastYear] = Object.create(null);
                } else {
                    curPastMonth--;
                }
                this._displayedYearsToMonths[curPastYear][curPastMonth] = [];
            }
        } else {
            endMonthLimitToDisplay = this._amountOfMonthsToDisplay;
            for (let monthOffset = 1; monthOffset < endMonthLimitToDisplay; monthOffset++) {
                // Если возможный диапазон выбора дат 
                // захватывает год в будущем, до
                // добавлем новые клюбчи в массив отображаемых дат
                if (curFutureMonth == DECEMBER) {
                    curFutureMonth = JANUARY;
                    curFutureYear++;
                    this._displayedYearsToMonths[curFutureYear] = Object.create(null);
                } else {
                    curFutureMonth++;
                }
                this._displayedYearsToMonths[curFutureYear][curFutureMonth] = [];
            }
        }
    };
    /**
     * Проверка входит ли данная дата, переданная как раздельно год, месяц и день
     * в разрешенный диапазон выбора дат (если такая настройка установлена)
     * @returns 
     */
    isDateInPossibleRange(year, month, day) {
        if (this.isLimitPossibleDaysWithRange) {
            if (year < this._startPossibleYear || month < this._startPossibleMonth || day < this._startPossibleDay ||
                year > this._endPossibleYear || month > this._endPossibleMonth || day > this._endPossibleDay) {
                return false;
            }
        }
        return true;
    };
    /**
     * Создание верстки окна выбора даты (календаря)
     */
    #createDateCalendarContainer() {
        this._yearsContainer = document.createElement('div');
        this._monthsContainer = document.createElement('div');
        this._yearsContainer.setAttribute('class', 'years');
        this._yearsContainer.style.display = 'none';
        this._monthsContainer.setAttribute('class', 'months');
        this._yearIndicator = document.createElement('p');
        this._yearIndicator.setAttribute('class', 'year-indicator');
        this._leafOverFuture = document.createElement('span');
        this._leafOverFuture.setAttribute('class', 'leaf-over-future');
        this._leafOverFuture.textContent = '>';
        this._leafOverPast = document.createElement('span');
        this._leafOverPast.setAttribute('class', 'leaf-over-past');
        this._leafOverPast.textContent = '<';
        this._monthsContainer.appendChild(this._leafOverFuture);
        this._monthsContainer.appendChild(this._leafOverPast);
        this._dateCalendarContainer.appendChild(this._yearsContainer);
        this._dateCalendarContainer.appendChild(this._yearIndicator);
        this._dateCalendarContainer.appendChild(this._monthsContainer);
        // Теперь заполняем возможный для выбор диапазон годов
        for (let yearInPossibleRange = this._curYear - Math.floor(this._YEARS_RANGE / 2); yearInPossibleRange < this._curYear + Math.floor(this._YEARS_RANGE / 2); yearInPossibleRange++) {
            this._possibleYears.push(yearInPossibleRange);
        }
        // Заполняем секцию выбора возможных годов
        let amountOfPossibleYears = this._possibleYears.length;
        this._possibleYears.forEach(function (year) {
            let yearNode = document.createElement('span');
            yearNode.className = 'year';
            yearNode.innerHTML = year;
            yearNode.dataset.year = year;
            yearNode.style.width = (this._amountOfRowsForYears * 100 / amountOfPossibleYears) + '%';
            if (!(year in this._yearNodes)) {
                this._yearNodes.push(yearNode);
            }
            this._yearsContainer.appendChild(yearNode);
        }.bind(this));
        for (let i = 0; i < this._amountOfMonthsToDisplay; i++) {
            let monthHeadingNode = document.createElement('h4');
            monthHeadingNode.className = 'month-heading';
            let monthContainerNode = document.createElement('div');
            monthContainerNode.className = 'month-container';
            monthContainerNode.style.width = 100 / this._amountOfMonthsToDisplay + '%';
            monthContainerNode.appendChild(monthHeadingNode);
            this.#appendDaysHeadingsToMonthContainerNode(monthContainerNode);
            this._monthsContainer.appendChild(monthContainerNode);
        }
    };
    /**
     * Создание верстки окна выбора времени
     */
    #createTimeSelectorContainer() {
        this._timeSelectorContainer = document.createElement('div');
        this._timeSelectorContainer.className = 'time-selector';
        this._timeSelectorContainer.style.position = 'static';
        this._timeSelectorContainer.style.width = '100%';
        //-------------------------------------------------------------
        this._upHoursStartButton = document.createElement('span');
        this._downHoursStartButton = document.createElement('span');
        this._upMinutesStartButton = document.createElement('span');
        this._downMinutesStartButton = document.createElement('span');
        this._upHoursStartButton.className = 'up-button';
        this._downHoursStartButton.className = 'down-button';
        this._upMinutesStartButton.className = 'up-button';
        this._downMinutesStartButton.className = 'down-button';
        this._upHoursStartButton.textContent = '+';
        this._downHoursStartButton.textContent = '-';
        this._upMinutesStartButton.textContent = '+';
        this._downMinutesStartButton.textContent = '-';
        this._upHoursStartButton.addEventListener('click', this.#upHoursButtonClickHandler.bind(this));
        this._downHoursStartButton.addEventListener('click', this.#downHoursButtonClickHandler.bind(this));
        this._upMinutesStartButton.addEventListener('click', this.#upMinutesButtonClickHandler.bind(this));
        this._downMinutesStartButton.addEventListener('click', this.#downMinutesButtonClickHandler.bind(this));
        //-------------------------------------------------------------
        this._hoursContainer = document.createElement('div');
        this._hoursContainer.setAttribute('class', 'hours-container');
        this._timeSelectorContainer.appendChild(this._hoursContainer);
        let hoursStartSelectorlabel = document.createElement('label');
        hoursStartSelectorlabel.textContent = 'Час:';
        hoursStartSelectorlabel.setAttribute('for', 'hours-selector');
        this._hoursContainer.appendChild(hoursStartSelectorlabel);
        this._hoursContainer.appendChild(this._downHoursStartButton);
        this._hoursStartSelector = document.createElement('input');
        this._hoursStartSelector.type = 'text';
        this._hoursStartSelector.setAttribute('class', 'hours-selector');
        this._hoursStartSelector.addEventListener('keydown', this.#keyDownHoursSelectorHandler.bind(this));
        this._hoursContainer.appendChild(this._hoursStartSelector);
        this._hoursContainer.appendChild(this._upHoursStartButton);
        this._minutesContainer = document.createElement('div');
        this._minutesContainer.setAttribute('class', 'minutes-container');
        this._timeSelectorContainer.appendChild(this._minutesContainer);
        let minutesStartSelectorlabel = document.createElement('label');
        minutesStartSelectorlabel.textContent = 'Минуты:';
        minutesStartSelectorlabel.setAttribute('for', 'minutes-selector');
        this._minutesContainer.appendChild(minutesStartSelectorlabel);
        this._minutesContainer.appendChild(this._downMinutesStartButton);
        this._minutesStartSelector = document.createElement('input');
        this._minutesStartSelector.type = 'text';
        this._minutesStartSelector.setAttribute('class', 'minutes-selector');
        this._minutesStartSelector.addEventListener('keydown', this.#keyDownMinutesSelectorHandler.bind(this));
        this._minutesContainer.appendChild(this._minutesStartSelector);
        this._minutesContainer.appendChild(this._upMinutesStartButton);
        if (this.isPeriodMode) {
            //-------------------------------------------------------------
            this._upHoursEndButton = document.createElement('span');
            this._downHoursEndButton = document.createElement('span');
            this._upMinutesEndButton = document.createElement('span');
            this._downMinutesEndButton = document.createElement('span');
            this._upHoursEndButton.className = 'up-button';
            this._downHoursEndButton.className = 'down-button';
            this._upMinutesEndButton.className = 'up-button';
            this._downMinutesEndButton.className = 'down-button';
            this._upHoursEndButton.textContent = '+';
            this._downHoursEndButton.textContent = '-';
            this._upMinutesEndButton.textContent = '+';
            this._downMinutesEndButton.textContent = '-';
            this._upHoursEndButton.addEventListener('click', this.#upHoursButtonClickHandler.bind(this));
            this._downHoursEndButton.addEventListener('click', this.#downHoursButtonClickHandler.bind(this));
            this._upMinutesEndButton.addEventListener('click', this.#upMinutesButtonClickHandler.bind(this));
            this._downMinutesEndButton.addEventListener('click', this.#downMinutesButtonClickHandler.bind(this));
            //-------------------------------------------------------------
            let hoursEndSelectorlabel = document.createElement('label');
            hoursEndSelectorlabel.textContent = 'Час:';
            hoursEndSelectorlabel.setAttribute('for', 'hours-selector');
            this._hoursContainer.appendChild(hoursEndSelectorlabel);
            this._hoursContainer.appendChild(this._upHoursEndButton);
            this._hoursEndSelector = document.createElement('input');
            this._hoursEndSelector.type = 'text';
            this._hoursEndSelector.setAttribute('class', 'hours-selector');
            this._hoursEndSelector.addEventListener('keydown', this.#keyDownHoursSelectorHandler.bind(this));
            this._hoursContainer.appendChild(this._hoursEndSelector);
            this._hoursContainer.appendChild(this._downHoursEndButton);
            let minutesEndSelectorlabel = document.createElement('label');
            minutesEndSelectorlabel.textContent = 'Минуты:';
            minutesEndSelectorlabel.setAttribute('for', 'minutes-selector');
            this._minutesContainer.appendChild(minutesEndSelectorlabel);
            this._minutesContainer.appendChild(this._upMinutesEndButton);
            this._minutesEndSelector = document.createElement('input');
            this._minutesEndSelector.type = 'text';
            this._minutesEndSelector.setAttribute('class', 'minutes-selector');
            this._minutesEndSelector.addEventListener('keydown', this.#keyDownMinutesSelectorHandler.bind(this));
            this._minutesContainer.appendChild(this._minutesEndSelector);
            this._minutesContainer.appendChild(this._downMinutesEndButton);
        }
        this._dateCalendarContainer.appendChild(this._timeSelectorContainer);
        this._applyDateTimeButton = document.createElement('button');
        this._applyDateTimeButton.className = 'apply-date-time-button';
        this._applyDateTimeButton.textContent = 'Выбрать';
        this._applyDateTimeButton.addEventListener('click', this.#applyDateTimeButtonClickListener.bind(this));
        this._dateCalendarContainer.appendChild(this._applyDateTimeButton);
        this.highLightTime();
    };

    /**
     * Обработчик нажатия кнопки подтверждения выбора даты и времени в окне выбора времени
     */
    #applyDateTimeButtonClickListener(e) {
        if (this.isPeriodMode) {
            if (this.isShowDate) {
                this.updateSelectedDateStart(this._pickedStartYear, this._pickedStartMonth, this._pickedStartDay);
                this.updateSelectedDateEnd(this._pickedEndYear, this._pickedEndMonth, this._pickedEndDay);
            }
            if (this.isShowTime) {
                this.updateSelectedTimeStart(this._hoursStartSelector.value, this._minutesStartSelector.value);
                this.updateSelectedTimeEnd(this._hoursEndSelector.value, this._minutesEndSelector.value);
            }
        } else {
            if (this.isShowDate) {
                this.updateSelectedDateStart(this._pickedStartYear, this._pickedStartMonth, this._pickedStartDay);
            }
            if (this.isShowTime) {
                this.updateSelectedTimeStart(this._hoursStartSelector.value, this._minutesStartSelector.value);
            }
        }
        this.#updateInputValue();
        this.toggle(e);
    }
    /**
     * Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     */
    #leafOverFutureClickHandler(e) {
        if (this._curDisplayedMonth == DECEMBER) {
            this._curDisplayedMonth = JANUARY;
            this._curDisplayedYear++;
        } else {
            this._curDisplayedMonth++;
        }
        this.redrawDays(e);
    };
    /**
     *  Обработчик события нажатия кнопки перемотки месяцев календаря в будущее
     */
    #leafOverPastClickHandler(e) {
        if (this._curDisplayedMonth == JANUARY) {
            this._curDisplayedMonth = DECEMBER;
            this._curDisplayedYear--;
        } else {
            this._curDisplayedMonth--;
        }
        this.redrawDays(e);
    };
    /**
     *  Обработчик события нажатий кнопки с изображением отображаемого в календаре года
     */
    #yearIndicatorClickHandler(e) {
        if (this.isDisplayed(this._yearsContainer)) {
            this.hide(this._yearsContainer);
        } else {
            this.show(this._yearsContainer);
        }
    };
    /**
     *  Обработчик события обработки нажатий кнопки мыши внутри контейнера выбора годов 
     */
    #yearsContainerClickHandler(e) {
        if (e.target.classList.contains('year')) {
            this._curDisplayedYear = e.target.dataset.year;
            this._redrawDays(e);
            this.hide(this._yearsContainer);
        }
    }

    /**
     * Проверка, имеется ли месяц с переданным номеров в дереве DOM
     */
    #isMonthNodeExistsInDom(month) {
        let monthContainerNodes = this._monthsContainer.getElementsByClassName('monmonth-containerth');
        monthContainerNodes.forEach(function (elem) {
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
    #getAmountOfMonthsInDOM() {
        return this._monthsContainer.getElementsByClassName('month-container').length;
    };


    /**
     * Инициализация расчета разрешенного периода выбора дат
     */
    #calculatePossibleDateRange() {
        this._startPossibleDay = day - Math.floor(this._possibleDaysRange / 2);
        this._endPossibleDay = day + Math.floor(this._possibleDaysRange / 2);
        let curYear = year;
        let curMonth = month;
        this._startPossibleYear = this._curYear;
        this._endPossibleYear = this._curYear;
        this._startPossibleMonth = this._curMonth;
        this._endPossibleMonth = this._curMonth;
        if (this._startPossibleDay < 0) {
            while (startPossibleDay < 0) {
                curMonth--;
                this._startPossibleDay = this._startPossibleDay + this._getDaysCountOfMonth(curYear, curMonth);
            }
            this._startPossibleYear = curYear;
            this._startPossibleMonth = curMonth;
        }
        if (this._endPossibleDay > this._getDaysCountOfMonth(year, month)) {
            curYear = year;
            curMonth = month;
            while (endPossibleDay > this._getDaysCountOfMonth(curYear, curMonth)) {
                curMonth++;
                this._endPossibleDay = this._endPossibleDay - this._getDaysCountOfMonth(curYear, curMonth);
            }
            this._endPossibleYear = curYear;
            this._endPossibleMonth = curMonth;
        }
    };
    /**
     * Метод формирует заголовок индикатора года на основе 
     * рассчитанного массива годов и месяцев для отображения в календаре
     * @returns string
     */
    #getYearIndicatorBasedOnCalculatedDaysToDisplay() {
        let yearIndicatorValue = '';
        for (let year in this._displayedYearsToMonths) {
            if (yearIndicatorValue.length) {
                yearIndicatorValue += '/';
            }
            yearIndicatorValue += year;
        }
        return yearIndicatorValue;
    };
    /**
     * Поиск DOM элементов по значению опредленного
     * атрибута внутри какого-либо другого DOM-элемента
     * @returns array
     */
    #getDOMNodesByAttributeValue(parent, attribute, value) {
        let foundElements = [];
        let allParentChilds = parent.getElementsByTagName('*');
        for (let i = 0; i < allParentChilds.length; i++) {
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
    #getDOMNodeByAttributeValue(parent, attribute, value) {
        let allParentChilds = parent.getElementsByTagName('*');
        for (let i = 0; i < allParentChilds.length; i++) {
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
    #appendDaysHeadingsToMonthContainerNode(monthContainerNode) {
        let monthDayHeadingsContainer = document.createElement('div');
        monthDayHeadingsContainer.className = 'month-day-headings';
        for (let i = 0; i < DAYS_IN_WEEK; i++) {
            let monthDayHeading = document.createElement('span');
            monthDayHeading.className = 'month-day-heading';
            monthDayHeading.textContent = Calendar.getDayNameByNumber(i);
            monthDayHeadingsContainer.appendChild(monthDayHeading);
        }
        monthContainerNode.appendChild(monthDayHeadingsContainer);
    }
    /**
     * Метод возвращает краткое текстовое 
     * наименования дня недели по его индексу
     * @returns 
     */
    static getDayNameByNumber(dayNumber) {
        return Calendar._dayNames[dayNumber];
    }

    /**
     * Подсветка в календаре выбранного времени
     */
    highLightTime() {
        if (this.isPeriodMode) {
            if (this._selectedEndHour || this._selectedEndMinutes) {
                this._hoursStartSelector.value = this._selectedEndHour;
                if (this._hoursStartSelector.value.length == 1) {
                    this._hoursStartSelector.value = '0' + this._hoursStartSelector.value;
                }
                this._minutesStartSelector.value = this._selectedEndMinutes;
                if (this._minutesStartSelector.value.length == 1) {
                    this._minutesStartSelector.value = '0' + this._minutesStartSelector.value;
                }
            }
        } else {
            if (this._selectedStartHour || this._selectedStartMinute) {
                this._hoursStartSelector.value = this._selectedStartHour;
                if (this._hoursStartSelector.value.length == 1) {
                    this._hoursStartSelector.value = '0' + this._hoursStartSelector.value;
                }
                this._minutesStartSelector.value = this._selectedStartMinute;
                if (this._minutesStartSelector.value.length == 1) {
                    this._minutesStartSelector.value = '0' + this._minutesStartSelector.value;
                }
            }
        }
    }
    /**
     * Снятие подсветки выбранных дней со всего календаря
     */
    unHighLightDays() {
        Array.from(this._monthsContainer.getElementsByClassName('day')).forEach(node => {
            node.classList.remove('in-selected-period');
            node.classList.remove('selected');
        });
    };
    /**
     * Обработчик нажатия кнопки увеличения часов
     */
    #upHoursButtonClickHandler() {
        if (this._hoursStartSelector.value < 23) {
            if (this._hoursStartSelector.value.length === 0) {
                this._hoursStartSelector.value = 1;
            } else {
                this._hoursStartSelector.value = parseInt(this._hoursStartSelector.value) + 1;
            }
            if (this._hoursStartSelector.value.length == 1) {
                this._hoursStartSelector.value = '0' + this._hoursStartSelector.value;
            }
        }
    };
    /**
     * Обработчик нажатия кнопки уменьшения часов
     */
    #downHoursButtonClickHandler(e) {
        if (this._hoursStartSelector.value > 0) {
            this._hoursStartSelector.value = parseInt(this._hoursStartSelector.value) - 1;
        }
        if (this._hoursStartSelector.value.length == 1) {
            this._hoursStartSelector.value = '0' + this._hoursStartSelector.value;
        }
    };
    /**
     * Обработчик нажатия кнопки увеличения минут
     */
    #upMinutesButtonClickHandler(e) {
        if (this._minutesStartSelector.value < 59) {
            if (this._minutesStartSelector.value.length === 0) {
                this._minutesStartSelector.value = 1;
            } else {
                this._minutesStartSelector.value = parseInt(this._minutesStartSelector.value) + 1;
            }
            if (this._minutesStartSelector.value.length == 1) {
                this._minutesStartSelector.value = '0' + this._minutesStartSelector.value;
            }
        }
    };
    /**
     * Обработчик нажатия кнопки уменьшения минут
     */
    #downMinutesButtonClickHandler(e) {
        if (this._minutesStartSelector.value > 0) {
            this._minutesStartSelector.value = parseInt(this._minutesStartSelector.value) - 1;
        }
        if (this._minutesStartSelector.value.length == 1) {
            this._minutesStartSelector.value = '0' + this._minutesStartSelector.value;
        }
    };
    /**
     * Обработчик нажатия клавиши в поле ввода часов
     */
    #keyDownHoursSelectorHandler(e) {
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
    #keyDownMinutesSelectorHandler(e) {
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
     * Инициализация выбранных ранее даты и времени
     */
    #initSelectedDateTimeParams() {
        let inputValue = this.#input.value.trim();
        // Если в поле ввода есть какие-то данные - "подтягиваем" их
        if (inputValue.replace(/(\S)/g, '$1').length > 0) {
            if (this.isShowDate) {
                this._selectedStartDay = Number(inputValue.substring(0, 2));
                this._selectedStartMonth = Number(inputValue.substring(3, 5)) - 1;
                this._selectedStartYear = Number(inputValue.substring(6, 10));
                if (this.isShowTime) {
                    this._selectedStartHour = Number(inputValue.substring(11, 13));
                    this._selectedStartMinute = Number(inputValue.substring(14));
                }
            } else if (this.isShowTime) {
                this._selectedStartHour = Number(inputValue.substring(0, 2));
                this._selectedStartMinute = Number(inputValue.substring(3, 5));
            }
            if (this.isPeriodMode) {
                if (this.isShowDate) {
                    this._selectedYearStart = Number(inputValue.substring(24, 28));
                    this._selectedEndMonth = Number(inputValue.substring(21, 23)) - 1;
                    this._selectedEndDay = Number(inputValue.substring(18, 20));
                    if (this.isShowTime) {
                        this._selectedEndHour = Number(inputValue.substring(30, 32));
                        this._selectedEndMinutes = Number(inputValue.substring(33));
                    }
                } else if (this.isShowTime) {
                    this._selectedStartHour = Number(inputValue.substring(8, 10));
                    this._selectedStartMinute = Number(inputValue.substring(11, 13));
                }
            }
        }
    };
    #addBodyClickEventHandler() {
        let calendar = this;
        document.body.addEventListener('click', function (e) {
            if (calendar.isDisplayed(calendar.dateCalendarContainer)) {
                let calendarContainerCoordinates = calendar.dateCalendarContainer.getBoundingClientRect();
                if (e.clientX < calendarContainerCoordinates.left || e.clientX > calendarContainerCoordinates.right ||
                    e.clientY < calendarContainerCoordinates.top || e.clientY > calendarContainerCoordinates.bottom) {
                    calendar.toggle(e);
                }
            }
        });
    };
    #dependedNodeValueCallBack() {
        let referenceInputDateTimeString = this._dependentNode.value;
        let referenceInputDay = parseInt(referenceInputDateTimeString.substring(0, 2));
        let referenceInputMonth = parseInt(referenceInputDateTimeString.substring(3, 5)) - 1;
        let referenceInputYear = parseInt(referenceInputDateTimeString.substring(6, 10));
        let referenceDate = new Date(referenceInputYear, referenceInputMonth, referenceInputDay);
        let date = new Date(this._selectedStartYear, this._selectedStartMonth, this._selectedStartDay);
        switch (this._dependentNodeCallBack) {
            case 'notGreater':
                if (this.isShowDate) {
                    if (referenceDate.getTime() <= date.getTime()) {
                        referenceDate.setFullYear(date.getFullYear());
                        referenceDate.setMonth(date.getMonth());
                        referenceDate.setDate(date.getDate());
                        let tempArray = this._dependentNode.value.split('');
                        tempArray.splice(0, 10, referenceDate.toLocaleDateString().slice(0, 10));
                        this._dependentNode.value = tempArray.join('');
                    }
                } else if (!this.isShowDate && this.isShowTime) {

                }
                break;
            case 'notLess':
                if (this.isShowDate) {
                    if (referenceDate.getTime() >= date.getTime()) {
                        referenceDate.setFullYear(date.getFullYear());
                        referenceDate.setMonth(date.getMonth());
                        referenceDate.setDate(date.getDate());
                        let tempArray = this._dependentNode.value.split('');
                        tempArray.splice(0, 10, referenceDate.toLocaleDateString().slice(0, 10));
                        this._dependentNode.value = tempArray.join('');
                    }
                } else if (!this.isShowDate && this.isShowTime) {

                }
                break;
        }
    }
}
/**
 * Вспомогательная функция расчета ширины элемента 
 * в пикселях на основе декларации ширины  из
 * правила CSS относительно размера ширины его родительского узла
 */
function getNodeOffsetWidth(node) {
    let nodeWidth = globalThis.getComputedStyle(node).width;
    if (nodeWidth.indexOf('%') != -1) {
        nodeWidth = getNodeContentWidth(node.parentNode) * parseFloat(nodeWidth) / 100;
    } else if (nodeWidth == 'auto') {
        nodeWidth = parseFloat(getNodeContentWidth(node.parentNode));
    } else {
        nodeWidth = parseFloat(nodeWidth);
    }
    return nodeWidth;
}
/**
 * Вспомогательная функция расчета ширины контента элемента 
 * в пикселях на основе декларации ширины из
 * правила CSS относительно размера ширины его родительского узла
 */
function getNodeContentWidth(node) {
    let nodeWidth = getNodeOffsetWidth(node);
    if (globalThis.getComputedStyle(node).boxSizing == 'border-box') {
        let nodePaddingLeft = parseFloat(globalThis.getComputedStyle(node).paddingLeft);
        let nodePaddingRight = parseFloat(globalThis.getComputedStyle(node).paddingRight);
        let nodeBorderLeftWidth = parseFloat(globalThis.getComputedStyle(node).borderLeftWidth);
        let nodeBorderRightWidth = parseFloat(globalThis.getComputedStyle(node).borderRightWidth);
        nodeWidth = nodeWidth - (nodePaddingLeft + nodePaddingRight + nodeBorderLeftWidth + nodeBorderRightWidth);
    }
    return nodeWidth;
}