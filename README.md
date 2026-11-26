\copy (SELECT md.die_no, ml.line_name, mdl.priority, mdl.cycle_time_sec AS cycle_time, mdl.setup_time_min AS setup_time FROM public.map_die_line mdl JOIN public.mst_line ml ON mdl.line_id = ml.line_id JOIN public.mst_die md ON mdl.die_id = md.die_id) TO '/path/to/die_line1_export.csv' WITH CSV HEADER;



secret= THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING
SAP_BASE_URL=http://snopapp.kalyanicorp.com/api/
SAP_USERNAME=snopadm
SAP_PASSWORD=snopa@dm!n



SELECT d.die_no,l.line_code,l.line_name,m.type,m.priority FROM (
SELECT mdl.*, COUNT(*) OVER (PARTITION BY mdl.die_id, mdl.type, mdl.priority) AS same_priority_lines
FROM map_die_line mdl WHERE mdl.status = true) m
JOIN mst_die  d ON d.die_id  = m.die_id
JOIN mst_line l ON l.line_id = m.line_id
WHERE m.same_priority_lines > 1
ORDER BY d.die_no, m.type, m.priority, l.line_code;

ls -lh /tmp/die_line_report_26-11-2026.csv
wc -l /tmp/die_line_report_26-11-2026.csv

scp root@vm1puat021:/tmp/die_line_report_26-11-2026.csv C:\Users\<YourUsername>\Downloads\