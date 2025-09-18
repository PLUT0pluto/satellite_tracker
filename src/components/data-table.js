import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import { global } from "../global-var.js";
import {globalMap} from "../map/map-global-var.js";
import actuallyMakeMarker from '../map/map-markers.js';

export function makeSatTable(){

    jQuery(function () {
        //make array for dataTable
        let data2 = (Array.from(global.satcat_csv.values())).map((item) => {
            //add checkbox html to front of each row, and add false to end for if checked
            return ["<label class='inline-flex items-center gap-2' style='padding-top: 8px;'>" +
            "<input type='checkbox' />" +
            "<span class='checkmark'></span>" +
            "</label>",
                 ...item, false]});

        //check all checkbox in footer  NOT USED
        let footer = [...data2[0]]
        footer[0] = "<label class='inline-flex items-center gap-2'>" +
            "<input type='checkbox' id='selectAll' />" +
            "<span class='checkmark'></span>" +
            "</label>";
        let tfoot = $('<tfoot><tr></tr></tfoot>');
        footer.forEach((value) => {
            tfoot.find('tr').append('<th>' + value + '</th>');
        });

        //make header
        let header = data2.shift().map((item => {
            return {title: item}; }));
        header[0] = ({title: "Select", searchable: false, sortable: true});
        header[header.length-1] = ({title: "Checked", visible: false});

        // Custom sorting for checkbox column
        $.fn.dataTable.ext.order['dom-checkbox'] = function(settings, col) {
            return this.api().column(col).nodes().map(function(td, i) {
                let isChecked = $('input[type="checkbox"]', td).prop('checked') ? false : true;
                return isChecked;
            });
        };

        //$('#satTable').append(tfoot);     uncomment to add selectAll back in

        $('#satTable').DataTable({
            paging: true,
            scrollX: true,
            scrollY: "400px",
            data: data2,
            columns: header,

            drawCallback: function(settings) {
                $('#satTable').trigger('draw.dt');
            },

            columnDefs: [
                {
                    targets: header.length - 1, // Target the hidden column
                    visible: false, // Make the column hidden
                    searchable: false
                },
                {
                    targets: 0, // Target the checkbox column
                    render: function (data, type, row) {
                        if (type === 'sort') {
                            // Use the hidden bool for sorting
                            return global.all_markers.has(row[1]) ? 0 : 1;
                        }
                        return data;
                    },
                    orderable: true,
                },
                {
                    className: "dt-center", //center all text
                    targets: "_all"
                }
            ],
            order: [[1, 'asc']],

        });

        // Select All checkbox functionality  NOT USED
        $('#satTable').on('draw.dt', function(){
            $('input[type="checkbox"]', '#satTable tbody').each(function() {
                const satName = $(this).closest('tr').find('td').eq(1).text();
                $(this).prop('checked', global.all_markers.has(satName));
                if(global.all_markers.get(satName) == "idk2"){
                    const row = $(this).closest('tr');
                    row.addClass('redColor');
                }
            });
            const allChecked = $('input[type="checkbox"]', '#satTable tbody').length === $('input[type="checkbox"]:checked', '#satTable tbody').length;
            $('#selectAll').prop('checked', allChecked);
        });

        $('#satTable').on('click', '#selectAll', function(e){
            if($(this).prop('checked')){ //turn on
                $('input[type="checkbox"]:not(:checked)', '#satTable tbody').each(function() {
                    const satName = $(this).closest('tr').find('td').eq(1).text();
                    actuallyMakeMarker(satName);
                    $(this).prop('checked', true);
                    const row = $(this).closest('tr');
                    const rowData = $('#satTable').DataTable().row(row).data();
                    rowData[rowData.length - 1] = $(this).prop('checked');
                });
            }
            else{
                $('input[type="checkbox"]:checked', '#satTable tbody').each(function() {
                    const satName = $(this).closest('tr').find('td').eq(1).text();
                    const satMark = global.all_markers.get(satName);
                    if(global.markerHighlighted.includes(satMark)) {
                        globalMap.map.removeLayer(satMark);
                        if(globalMap.geoJsonLayerMap.get(satMark)) {
                            globalMap.geoJsonLayer.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[0]);
                            globalMap.geoJsonLayer2.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[1]);
                            globalMap.geoJsonRTree.delete(satMark);
                            globalMap.geoJsonTime.delete(satMark);
                            globalMap.geoJsonLayerMap.delete(satMark);
                        }
                        if(globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
                        if(globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();

                        const inde = global.markerHighlighted.indexOf(satMark);
                        if(inde !== -1) global.markerHighlighted.splice(inde, 1);
                    }
                    if(satMark == "idk2")
                    {
                        global.all_markers.delete(satName);
                        global.all_markers.delete(satName + "idk");
                    }
                    else{
                        global.all_markers.delete(satName);
                        global.all_markers.delete(satMark);
                        globalMap.markLayer.removeLayer(satMark);
                    }
                    $(this).prop('checked', false); // Uncheck selectAll if one is unchecked
                    const row = $(this).closest('tr');
                    const rowData = $('#satTable').DataTable().row(row).data();
                    rowData[rowData.length - 1] = $(this).prop('checked');
                });
            }
            $('#satCount').text("Satellites on map: " + globalMap.markLayer.getLayers().length);
            $('#satTable').DataTable().row(row).data(rowData).draw(false); // Refresh the table
        });


        // Individual checkbox click handling
        $('#satTable tbody').on('click', 'input[type="checkbox"]', function(){
            //find checkbox state
            const row = $(this).closest('tr');
            const rowData = $('#satTable').DataTable().row(row).data();
            rowData[rowData.length - 1] = $(this).prop('checked');

            //check or uncheck
            if (!$(this).prop('checked')) {
                const satName = $(this).closest('tr').find('td').eq(1).text();
                const satMark = global.all_markers.get(satName);
                if(global.markerHighlighted.includes(satMark)) {
                    globalMap.map.removeLayer(satMark);
                    if(globalMap.geoJsonLayerMap.get(satMark)) {
                        globalMap.geoJsonLayer.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[0]);
                        globalMap.geoJsonLayer2.removeLayer(globalMap.geoJsonLayerMap.get(satMark)[1]);
                        globalMap.geoJsonRTree.delete(satMark);
                        globalMap.geoJsonTime.delete(satMark);
                        globalMap.geoJsonLayerMap.delete(satMark);
                    }
                    if(globalMap.geoJsonCircle) globalMap.geoJsonCircle.remove();
                    if(globalMap.geoJsonPopup) globalMap.geoJsonPopup.remove();

                    const inde = global.markerHighlighted.indexOf(satMark);
                    if(inde !== -1) global.markerHighlighted.splice(inde, 1);
                }
                if(satMark == "idk2")
                {
                    global.all_markers.delete(satName);
                    global.all_markers.delete(satName + "idk");
                }
                else{
                    global.all_markers.delete(satName);
                    global.all_markers.delete(satMark);
                    globalMap.markLayer.removeLayer(satMark);
                }
                $('#selectAll').prop('checked', false); // Uncheck selectAll if one is unchecked
            } else {
                actuallyMakeMarker($(this).closest('tr').find('td').eq(1).text());
                // Check if all are checked to update selectAll
                const allChecked = $('input[type="checkbox"]', '#satTable tbody').length === $('input[type="checkbox"]:checked', '#satTable tbody').length;
                $('#selectAll').prop('checked', allChecked);
            }

            $('#satCount').text("Satellites on map: " + globalMap.markLayer.getLayers().length); //add to counter
            $('#satTable').DataTable().row(row).data(rowData).draw(false); // Refresh the table
        });
    });

}

