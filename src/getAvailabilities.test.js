import knex from 'knexClient'
import getAvailabilities from './getAvailabilities'

describe('getAvailabilities', () => {
  beforeEach(() => knex('events').truncate())

  describe('simple case', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true,
        }, 
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2019-01-02 13:30'),
          ends_at: new Date('2019-01-02 17:30'),
        },
        {
          kind: 'appointment',
          starts_at: new Date('2019-01-02 14:30'),
          ends_at: new Date('2019-01-02 15:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2005-02-16 08:00'),
          ends_at: new Date('2005-02-16 18:00'),
          weekly_recurring: true,
        },
        {
          kind: 'appointment',
          starts_at: new Date('2005-02-16 11:00'),
          ends_at: new Date('2005-02-16 15:30'),
        },
      ])
    })

    function log(message) {
        console.log(message);
    }
      
    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'))
      
      expect(availabilities.length).toBe(7)

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10')),
      )
        
      expect(availabilities[0].slots).toEqual([])

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11')),
      )
        
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ])

      expect(availabilities[2].slots).toEqual([])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16')),
      )
    })
      
    it('should pass test with last day of december', async () => {
      const availabilities = await getAvailabilities(new Date('2018-12-31'))
      
      expect(availabilities.length).toBe(7)

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2019-01-01')),
      )
        
      expect(availabilities[0].slots).toEqual([
        '9:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
      ])

      expect(String(availabilities[4].date)).toBe(
        String(new Date('2019-01-04')),
      )
        
      expect(String(availabilities[2].date)).toBe(
        String(new Date('2019-01-02')),
      )
        
      expect(availabilities[2].slots).toEqual([
        '13:30',
        '14:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00'
      ])

      expect(availabilities[3].slots).toEqual([])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2019-01-06')),
      )
    })
      
    it('should pass test from 2005 with one day full opening and not recurring', async () => {
      const availabilities = await getAvailabilities(new Date('2005-02-14'))
      
      expect(availabilities.length).toBe(7)

      expect(String(availabilities[2].date)).toBe(
        String(new Date('2005-02-16')),
      )
        
      expect(availabilities[0].slots).toEqual([
        '9:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
      ])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2005-02-20')),
      )

      expect(availabilities[2].slots).toEqual([
        '8:00',
        '8:30',
        '9:00',
        '9:30',
        '10:00',
        '10:30',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
      ])

      expect(availabilities[3].slots).toEqual([])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2005-02-20')),
      )
    })
  })
})
