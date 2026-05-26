import os

sql_path = 'd:\\HIMALAY\\1000-html-game-php-by-digirg\\poko_postgres.sql'
output_path = 'd:\\HIMALAY\\1000-html-game-php-by-digirg\\omniplay-nextjs\\public\\missing_tables.sql'

with open(sql_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Extract from line 24140 (index 24139) to the end
missing_sql = lines[24139:]

with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(missing_sql)

print(f'Successfully wrote {len(missing_sql)} lines of missing SQL to {output_path}')
