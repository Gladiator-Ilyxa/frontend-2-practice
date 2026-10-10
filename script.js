// ДАННЫЕ

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const DAYS_OF_WEEK = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
  'Четверг', 'Пятница', 'Суббота'
];

// Доступные слоты по датам (Год-Месяц-День)
const SLOTS_DATA = {
  '2025-6-2': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-3': ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
  '2025-6-4': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-5': ['10:00', '12:00', '14:00', '15:00', '16:00', '17:00'], // День по умолчанию
  '2025-6-6': ['11:00', '13:00', '15:00', '17:00'],
  '2025-6-9': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-10': ['10:00', '11:00', '12:00', '14:00', '15:00', '17:00'],
  '2025-6-11': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-12': ['11:00', '13:00', '16:00'],
  '2025-6-13': ['10:00', '12:00', '14:00', '15:00', '17:00'],
  '2025-6-16': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-17': ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
  '2025-6-18': ['10:00', '12:00', '14:00', '16:00'],
  '2025-6-19': ['10:00', '12:00', '14:00', '15:00', '17:00'],
  '2025-6-20': ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
};

// СОСТОЯНИЕ 

const state = {
  currentMonth: 5, // Июнь (0-индексный)
  currentYear: 2025,
  selectedDay: null,
  selectedTime: null,
  today: new Date(2025, 5, 1) // Для тестирования — 1 июня 2025
};

// ЧИСТЫЕ ФУНКЦИИ

function compareDates(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function isDateSelectable(day, month, year, today) {
  const date = new Date(year, month, day);
  return date >= today;
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Понедельник = 0, Воскресенье = 6
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;
  
  const weeks = [];
  let currentWeek = [];
  
  // Пустые ячейки до первого дня месяца
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    currentWeek.push({
      day: prevMonthLastDay - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false
    });
  }
  
  // Дни текущего месяца
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({
      day,
      month,
      year,
      isCurrentMonth: true
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Дни следующего месяца
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        day: nextDay,
        month: month + 1,
        year: year,
        isCurrentMonth: false
      });
      nextDay++;
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

function formatDateKey(year, month, day) {
  return `${year}-${month + 1}-${day}`;
}

function formatDisplayDate(day, month, year) {
  const date = new Date(year, month, day);
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  const monthName = MONTHS_GENITIVE[month];
  return `${dayOfWeek}, ${day} ${monthName} ${year}`;
}

// РЕНДЕР 

function renderCalendar() {
  const monthLabel = document.getElementById('calendar-month');
  const daysContainer = document.getElementById('calendar-days');
  
  monthLabel.textContent = `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;
  
  const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
  
  let html = '';
  weeks.forEach(week => {
    week.forEach(dayInfo => {
      const isSelectable = dayInfo.isCurrentMonth && 
                          isDateSelectable(dayInfo.day, dayInfo.month, dayInfo.year, state.today);
      const isSelected = state.selectedDay && 
                        state.selectedDay.day === dayInfo.day &&
                        state.selectedDay.month === dayInfo.month &&
                        state.selectedDay.year === dayInfo.year;
      
      const classes = ['calendar__day'];
      if (!dayInfo.isCurrentMonth) classes.push('calendar__day--muted');
      if (!isSelectable) classes.push('calendar__day--disabled');
      if (isSelected) classes.push('calendar__day--selected');
      
      html += `<div class="${classes.join(' ')}" 
                    data-day="${dayInfo.day}" 
                    data-month="${dayInfo.month}" 
                    data-year="${dayInfo.year}">
                 ${dayInfo.day}
               </div>`;
    });
  });
  
  daysContainer.innerHTML = html;
  attachDayClickHandlers();
}

function renderTimeSlots() {
  const grid = document.getElementById('timeslots-grid');
  
  if (!state.selectedDay) {
    grid.innerHTML = '<p class="timeslots__empty" style="grid-column: 1 / -1; text-align: center; color: #888; padding: 20px 0;">Выберите дату</p>';
    return;
  }
  
  const dateKey = formatDateKey(
    state.selectedDay.year,
    state.selectedDay.month,
    state.selectedDay.day
  );
  
  const availableSlots = SLOTS_DATA[dateKey] || [];
  
  let html = '';
  
  if (availableSlots.length === 0) {
    html = '<p class="timeslots__empty" style="grid-column: 1 / -1; text-align: center; color: #888; padding: 20px 0;">Нет доступного времени на этот день</p>';
  } else {
    availableSlots.forEach(time => {
      const isSelected = state.selectedTime === time;
      const classes = ['timeslots__slot'];
      if (isSelected) classes.push('timeslots__slot--selected');
      
      html += `<button class="${classes.join(' ')}" data-time="${time}">
                 <span>${time}</span>
               </button>`;
    });
  }
  
  grid.innerHTML = html;
  attachTimeSlotClickHandlers();
}

function updateBottomBar() {
  const dateElement = document.getElementById('bottom-bar-date');
  const timeElement = document.getElementById('bottom-bar-time');
  
  if (state.selectedDay) {
    dateElement.textContent = formatDisplayDate(
      state.selectedDay.day,
      state.selectedDay.month,
      state.selectedDay.year
    );
  } else {
    dateElement.textContent = 'Выберите дату';
  }
  
  if (state.selectedTime) {
    timeElement.textContent = state.selectedTime;
    timeElement.style.display = 'inline';
  } else {
    timeElement.textContent = 'и время';
    timeElement.style.display = 'inline';
  }
}

// ОБРАБОТЧИКИ

function attachDayClickHandlers() {
  const days = document.querySelectorAll('.calendar__day:not(.calendar__day--muted):not(.calendar__day--disabled)');
  
  days.forEach(day => {
    day.addEventListener('click', (e) => {
      const dayNum = parseInt(e.currentTarget.dataset.day);
      const month = parseInt(e.currentTarget.dataset.month);
      const year = parseInt(e.currentTarget.dataset.year);
      
      state.selectedDay = { day: dayNum, month, year };
      state.selectedTime = null; // Сбрасываем время при смене дня
      
      renderCalendar();
      renderTimeSlots();
      updateBottomBar();
    });
  });
}

function attachTimeSlotClickHandlers() {
  const slots = document.querySelectorAll('.timeslots__slot');
  
  slots.forEach(slot => {
    slot.addEventListener('click', (e) => {
      const time = e.currentTarget.dataset.time;
      state.selectedTime = time;
      
      renderTimeSlots();
      updateBottomBar();
    });
  });
}

function setupMonthNavigation() {
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  
  prevBtn.addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    state.selectedDay = null;
    state.selectedTime = null;
    
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
  });
  
  nextBtn.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    state.selectedDay = null;
    state.selectedTime = null;
    
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
  });
}

function setupContinueButton() {
  const continueBtn = document.getElementById('continue-btn');
  
  continueBtn.addEventListener('click', () => {
    if (state.selectedDay && state.selectedTime) {
      const dateStr = formatDisplayDate(
        state.selectedDay.day,
        state.selectedDay.month,
        state.selectedDay.year
      );
      alert(`Запись оформлена!\nДата: ${dateStr}\nВремя: ${state.selectedTime}`);
    } else {
      alert('Пожалуйста, выберите дату и время');
    }
  });
}

// ИНИЦИАЛИЗАЦИЯ

function init() {
  // Устанавливаем день по умолчанию (5 июня 2025)
  state.selectedDay = { day: 5, month: 5, year: 2025 };
  
  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
  setupMonthNavigation();
  setupContinueButton();
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', init);