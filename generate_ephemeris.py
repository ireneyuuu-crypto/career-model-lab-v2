"""Generate daily tropical geocentric planetary longitudes at 00:00 UTC.
Source: pyswisseph/Swiss Ephemeris. Run locally; generated static JSON is consumed by the browser.
"""
import json, datetime, pathlib, swisseph as swe
ROOT=pathlib.Path(__file__).parent/'data'
BODIES=[swe.SUN,swe.MOON,swe.MERCURY,swe.VENUS,swe.MARS,swe.JUPITER,swe.SATURN,swe.URANUS,swe.NEPTUNE,swe.PLUTO]
swe.set_sid_mode(swe.SIDM_LAHIRI)
for year in range(1900,2071):
    date=datetime.date(year,1,1)
    rows=[]
    while date.year==year:
        jd=swe.julday(date.year,date.month,date.day,0)
        rows.append([round(swe.calc_ut(jd,body,swe.FLG_MOSEPH)[0][0] % 360,5) for body in BODIES] + [round(swe.get_ayanamsa_ut(jd),5)])
        date+=datetime.timedelta(days=1)
    (ROOT/f'{year}.json').write_text(json.dumps(rows,separators=(',',':')),encoding='utf-8')
print('Generated 1900–2070 daily files')
