const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const results = [];
const cityToDepartment = new Map();

//Se toma el csv brindado por el profesor para poder generar un set para un futuro mapeo de ciudades y departamentos.
fs.createReadStream('Departamentos_y_municipios_de_Colombia.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        results.forEach((row) => {
            const city = row['MUNICIPIO'].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); 
            const department = row['DEPARTAMENTO'].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); // Formatear las palabras, sin tildes y minisculas
            cityToDepartment.set(city, department); //Se mapea
        });
    });



app.use(cors());

app.get('/:city', (req, res) => {
    const city = req.params.city; //Se toma la ciudad como parametro del link, con eso se guarda y se sigue con el proceso.
    const cityWithoutAccents = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // Dependiendo de que ciudad sea, se hara lo siguiente para la respuesta.
    switch (cityWithoutAccents) {
        case 'bogota':
            res.send('Cundinamarca');
            break;
        case 'cartagena':
            res.send('Bolivar');
            break;
        case 'barranquilla':
            res.send('Atlantico');
            break;
        case 'santa marta':
            res.send('Magdalena');
            break;
        default:
            const department = cityToDepartment.get(cityWithoutAccents) || city;
            const departmentWithUppercase = department.charAt(0).toUpperCase() + department.slice(1); //Se escribe en mayuscula la primera letra

            res.send(departmentWithUppercase);

            break;
    }
});

app.get('/', (req, res) => {
    res.send('Bienvenido a la API de ciudades');
});

app.listen(port, () => {
    console.log(`App listening ${port}`)
});