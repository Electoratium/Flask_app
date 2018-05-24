from flask import Flask, render_template
from bson.json_util import dumps

from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)

db = client.world_bank

invalid_countrynames = ["Europe and Central Asia", "East Asia and Pacific", "Pacific Islands", "Middle East and North Africa", "Africa", "South Asia", "West Bank and Gaza", "Republic of Kosovo", "World"]

@app.route('/')
def landing():
    cursor = db.world.find({'countryname': {"$nin": invalid_countrynames}}, {"project_name", "countryname", "lendprojectcost", "countrycode"})
    data_set = dumps(cursor)

    return render_template('landing.html', countries=data_set)

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run()