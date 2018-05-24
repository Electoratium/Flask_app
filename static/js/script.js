document.addEventListener("DOMContentLoaded", () => {
    let initial_data = JSON.parse(document.getElementById('data_set').value);
    let series = {};
    let total_investments = 0;
    let country_projects = [];

    initial_data.sort((a,b)=> a['countryname'].localeCompare(b['countryname'])).reduce(unique_country);

    function unique_country(prev_country, cur_country) {
        let cur_project = {'project': cur_country['project_name'], 'cost': cur_country['lendprojectcost']};

        if(prev_country['countryname'] == cur_country['countryname']){
            total_investments += cur_country['lendprojectcost'];

            country_projects.push(cur_project);
        }
        else {
            if (total_investments == 0) {
                total_investments = prev_country['lendprojectcost'];

                country_projects = [cur_project]
            }
            series[getCountryISO3(prev_country['countrycode'])] = {
                'country_name': prev_country['countryname'],
                'projects': country_projects,
                'total_investments': total_investments
            };

            total_investments = cur_country['lendprojectcost'];
            country_projects = [cur_project]
        }

        return cur_country;
    }

    let only_values = [];

    for(let country in series){
        only_values.push(series[country]['total_investments']);
    }

    let min_value = Math.min.apply(null, only_values),
            max_value = Math.max.apply(null, only_values);

    let palette_scale = d3.scale.linear()
        .domain([min_value,max_value])
        .range(["#EFEFFF","#02386F"]);


    for(let country in series){
        series[country]['fillColor'] = palette_scale(series[country]['total_investments'])
    }

    new Datamap({
        element: document.getElementById('map'),
        projection: 'mercator',
        fills: { defaultFill: '#F5F5F5' },
        data: series,
        geographyConfig: {
            borderColor: '#DEDEDE',
            highlightBorderWidth: 2,
            // don't change color on mouse hover
            highlightFillColor: function(geo) {
                return geo['fillColor'] || '#F5F5F5';
            },
            // only change border
            highlightBorderColor: '#B7B7B7',
            // show desired information in tooltip
            popupTemplate: function(geo, data) {
                // don't show tooltip if country don't present in dataset
                if (!data) { return; }

                let tooltip = `<div class="country_tooltip">
                                <p class="title">${data.country_name}</p>
                                <table>
                                    <tr>
                                        <th>Projects</th>
                                        <th>Cost</th>
                                    </tr>`;
                for(let project of data.projects){
                    tooltip += `<tr class="project">
                                    <td>${project.project}</td>
                                    <td>${project.cost}</td>
                                </tr>`;
                }

                tooltip += `<tr>
                                <th>Total investments:</th>
                                <th> ${data.total_investments}</th>
                            </tr>
                                </table>
                            </div>`;

                return tooltip;
            }
        }
    });
});