\copy (SELECT md.die_no, ml.line_name, mdl.priority, mdl.cycle_time_sec AS cycle_time, mdl.setup_time_min AS setup_time FROM public.map_die_line mdl JOIN public.mst_line ml ON mdl.line_id = ml.line_id JOIN public.mst_die md ON mdl.die_id = md.die_id) TO '/path/to/die_line1_export.csv' WITH CSV HEADER;



secret= THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING
SAP_BASE_URL=http://snopapp.kalyanicorp.com/api/
SAP_USERNAME=snopadm
SAP_PASSWORD=snopa@dm!n