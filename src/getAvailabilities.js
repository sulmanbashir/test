import moment from 'moment'
import knex from 'knexClient'

function createArrayWith7FuturDays(date) {
    var i = 0, j = 0, convert_to_YYYY_MM_DD, next_day, array = [];
    
    while (i != 7) {
        convert_to_YYYY_MM_DD = moment(date).add(j, 'days').format('YYYY-MM-DD');
        next_day = { date: date = new Date(convert_to_YYYY_MM_DD), slots: []};
        array.push(next_day);
        j = 1;
        i++;
    }
    
    i = null, j = null, date = null, next_day = null, convert_to_YYYY_MM_DD = null;
    return (array);
}

function getWeekDay(weeklyReccuringOpening) {
    var i = 0, j = 0, recurrent_week_day, dayOfWeek, save_week_day = [];

    while (j != weeklyReccuringOpening.length) {
        dayOfWeek = moment(weeklyReccuringOpening[j].starts_at).weekday();
        recurrent_week_day = {week_day: dayOfWeek, start_at: weeklyReccuringOpening[j].starts_at, end_at: weeklyReccuringOpening[j].ends_at };
        save_week_day.push(recurrent_week_day);
        j++;
    }

    i = null, j = null, dayOfWeek = null, recurrent_week_day = null;
    return (save_week_day);
}

function getSlots(start_at, minutes) {
    return (moment(start_at).add(minutes, 'minutes').format('H:mm'));
}

function allSlotsAvailable(start_at, end_at) {
    var array = [], i = 0 , slots = 0;
    var difference_between_two_hours = ((end_at - start_at) / 3600000) * 2;

    while (i != difference_between_two_hours) {
        if (slots == end_at) {
            i = 10;
        } else {
            slots = getSlots(start_at, i * 30);
            array.push(slots);
        }
        i++;
    }
    
    i = null, difference_between_two_hours = null, slots = null;
    return (array);
}

function addRecurrentOpeningInMyArray(array, get_week_day, end) {
    var dayOfWeekFromArray, availableSlots, i = 0, j = 0;

    while (i != array.length) {
        while (j != get_week_day.length) {
            dayOfWeekFromArray = moment(array[i].date).weekday();
            if (dayOfWeekFromArray == get_week_day[j].week_day && array[array.length - 1].date <= end) {
                availableSlots = allSlotsAvailable(get_week_day[j].start_at, get_week_day[j].end_at);
                array[i].slots = [moment(get_week_day[j].start_at).format('h:mm'), moment(get_week_day[j].end_at).format('h:mm')];
                array[i].slots = availableSlots;
            }
            j++;
        }
        j = 0;
        i++;
    }
    
    i = null, j = null, dayOfWeekFromArray = null, availableSlots = null;
    return (array);
}

function addNotRecurrentOpeningInMyArray(array, allNotReccuringOpening) {
    var compare_from_array, compare_from_allNot_start, availableSllots;
    var i = 0, j = 0;
    
    while (i != array.length) {
        while (j != allNotReccuringOpening.length) {
            compare_from_array = moment(array[i].date).format('YYYY-MM-DD');
            compare_from_allNot_start = moment(allNotReccuringOpening[j].starts_at).format('YYYY-MM-DD');
            if (compare_from_array == compare_from_allNot_start) {
                availableSllots = allSlotsAvailable(moment(allNotReccuringOpening[j].starts_at).valueOf(), moment(allNotReccuringOpening[j].ends_at).valueOf());
                array[i].slots = availableSllots;
            }
            j++;
        }
        j = 0;
        i++;
    }

    i = null, j = null, compare_from_allNot_start = null, compare_from_array = null, availableSllots = null, allNotReccuringOpening = null;
    return (array);
}

function addAllAppointmentInMyArray(array, allAppointmentEvent) {
    var i = 0, j = 0, k = 0;
    var start_at, start_appointment, check_start_at_slots, check_end_at_slots;
    
    while (i != array.length) {
        while (j != allAppointmentEvent.length) {
            start_appointment = moment(allAppointmentEvent[j].starts_at).format('YYYY-MM-DD');
            start_at = moment(array[i].date).format('YYYY-MM-DD');
            if (start_at == start_appointment) {
                while (k != array[i].slots.length) {
                    check_start_at_slots = moment(allAppointmentEvent[j].starts_at).format('H:mm');
                    check_end_at_slots = moment(allAppointmentEvent[j].ends_at).format('H:mm');
                    if (array[i].slots[k] >= check_start_at_slots && array[i].slots[k] < check_end_at_slots) {
                        array[i].slots[k] = '';
                    }
                    k++;
                }
                var cleanAllEmpty = array[i].slots.filter(Boolean);
                array[i].slots = cleanAllEmpty;
               k = 0;
            }
            j++;
        }
        j = 0;
        i++;
    }

    i = null, j = null, k = null, allAppointmentEvent = null, start_at = null, start_appointment = null, check_start_at_slots = null, check_end_at_slots = null;
    return (array);
}

export default async function getAvailabilities(date) {
    var array = [], cleanArray = [], get_week_day = [];
    var start_date = moment(date).valueOf();
    var end_date = moment(date).add(6, 'days').valueOf();
    var last7days = moment(date).add(-6, 'days').valueOf();
    
    try {
        var weeklyReccuringOpening = await knex.schema.raw("SELECT * from `events` WHERE `weekly_recurring` = '1' AND kind = 'opening' ORDER BY `starts_at` ASC");
    } catch (error) {
        console.log(error);
    } 
    
    try {
        var allNotReccuringOpening = await knex.schema.raw("SELECT * from `events` WHERE kind = 'opening' AND weekly_recurring IS NULL AND `starts_at` between " + start_date + " AND " + end_date + " ORDER BY `starts_at` ASC");
    } catch (error) {
        console.log(error);
    }
    try {
        var allAppointmentEvent = await knex.schema.raw("SELECT * from `events` WHERE `starts_at` between " + start_date + " AND " + end_date + " AND kind = 'appointment' ORDER BY `starts_at` ASC");
    } catch (error) {
        console.log(error);
    }
        
    array = createArrayWith7FuturDays(date);
    get_week_day = getWeekDay(weeklyReccuringOpening);
    array = addRecurrentOpeningInMyArray(array, get_week_day, end_date);
    array = addNotRecurrentOpeningInMyArray(array, allNotReccuringOpening);
    array = addAllAppointmentInMyArray(array, allAppointmentEvent);

    cleanArray = null, get_week_day = null, start_date = null, end_date = null, last7days = null;
    weeklyReccuringOpening = null, allAppointmentEvent = null, allNotReccuringOpening = null;
    return (array);
}
