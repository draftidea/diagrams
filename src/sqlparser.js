exports.parseSQL = function parseSQL(sqlStr) {
    var parse_field = function (s) {
        var field = {
            "name": /`\w+`/.exec(s)[0],
            "type": /`\s\w+(\(\d+\))?/.exec(s)[0],
            "null": /NOT\sNULL/.test(s) ? /NOT\sNULL/.exec(s)[0] : "",
            "default": /DEFAULT\s.*?[\s,\n]/.test(s) ? /DEFAULT\s.*?[\s,\n]/.exec(s)[0] : "",
            "extra": /(AUTO_INCREMENT|ON UPDATE CURRENT_TIMESTAMP|SERIAL DEFAULT VALUE)/.test(s) ? /(AUTO_INCREMENT|ON UPDATE CURRENT_TIMESTAMP|SERIAL DEFAULT VALUE)/.exec(s)[0] : "",
            "comment": /COMMENT\s'.*?'/.test(s) ? /COMMENT\s'.*?'/.exec(s)[0] : ""
        }
        field['name'] = field['name'].replace(/`/g,'').trim()
        field['type'] = field['type'].replace(/`/g,'').trim()
        field['null'] = field['null'].replace(/,/,'').trim()
        field['default'] = field['default'].replace('DEFAULT','').replace("''","").replace(",", "").trim()
        field['extra'] = field['extra'].trim()
        field['comment'] = field['comment'].replace('COMMENT', '').replace(/'/g,"").trim()
        return field
    }
    var parse_index = function (s) {
        var index = {
            "name": /`\w+`/.exec(s)[0],
            "type": /(PRIMARY|UNIQUE|FULLTEXT)?\s?KEY/.exec(s)[0],
            "algorithm": /USING\s\w+/.test(s) ? /USING\s\w+/.exec(s)[0] : "",
            "field": /\(`\w+`(,`\w+`)*\)/.exec(s)[0]
        }
        index['name'] = index['name'].replace(/`/g,'').trim()
        index['type'] = index['type'].replace(/`/g,'').replace('(','').replace(')','').trim()
        index['field'] = index['field'].replace(/`/g,'').replace('(','').replace(')','').trim()
        index['algorithm'] = index['algorithm'].replace('USING','').trim()
        return index
    }
    var parse_constraint = function (s) {
        var constraint = {
            "name": /CONSTRAINT\s`(\w+)`/.exec(s)[0],
            "type": "FOREIGN KEY",
            "field": /FOREIGN\sKEY\s\(`(\w+)`\)/.exec(s)[1],
            "ref_table": /REFERENCES\s`(\w+)`/.exec(s)[1],
            "ref_field": /REFERENCES\s`\w+`\s\(`(\w+)`\)/.exec(s)[1],
            "on_delete": /ON\sDELETE\s[A-Za-z]+(\s[A-Za-z]+)?/.test(s) ? /ON\sDELETE\s[A-Za-z]+(\s[A-Za-z]+)?/.exec(s)[0] : "",
            "on_update": /ON\sUPDATE\s[A-Za-z]+(\s[A-Za-z]+)?/.test(s) ? /ON\sUPDATE\s[A-Za-z]+(\s[A-Za-z]+)?/.exec(s)[0] : ""
        }
        return constraint
    }
    table = {
        "name": "",
        "engine": "InnoDB",
        "comment": "",
        "charset": "utf8",
        "fields": [],
        "indexs": [],
        "constraints": []
    }
    var sql = sqlStr.split(/\n/);
    for (var i = 0, len = sql.length; i < len; i++) {
        if (i == 0) {
            table['name'] = /`\w*`/.exec(sql[i])[0]
            table['name'] = table['name'].replace(/`/g, '').trim()
        } else if (i == len - 1) {
            table['engine'] = /ENGINE=\w+/.test(sql[i]) ? /ENGINE=\w+/.exec(sql[i])[0] : "InnoDB"
            table['comment'] = /COMMENT='.*'/.test(sql[i]) ? /COMMENT='.*'/.exec(sql[i])[0] : ""
            table['charset'] = /CHARSET=\w+/.test(sql[i]) ? /CHARSET=\w+/.exec(sql[i])[0] : "utf8"
            table['engine'] = table['engine'].replace(/ENGINE=/, '').trim()
            table['comment'] = table['comment'].replace(/COMMENT=/,'').trim()
            table['charset'] = table['charset'].replace(/CHARSET=/,'').trim()
        } else {
            if (/^(PRIMARY|UNIQUE|FULLTEXT)?\s?KEY.*/.test(sql[i].trim())) {
                table['indexs'].push(parse_index(sql[i]))
            }
            if (/^CONSTRAINT\s.*/.test(sql[i])) {
                table['constraints'].push(parse_constraint(sql[i].trim()))
            }
            if (/^`\w+`.*/.test(sql[i].trim())) {
                table['fields'].push(parse_field(sql[i]))
            }
        }

    }
    return table
}
