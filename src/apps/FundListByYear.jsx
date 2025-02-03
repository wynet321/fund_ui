import { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Typography, Select, MenuItem, CardActions, Button, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent } from '@mui/material';

const baseUrl = "http://localhost:9000";
const year = [{ id: 0, name: "一年期", abbr: "oneyearrate" }, { id: 1, name: "三年期", abbr: "threeyearrate" }, { id: 2, name: "五年期", abbr: "fiveyearrate" }, { id: 3, name: "八年期", abbr: "eightyearrate" }, { id: 4, name: "十年期", abbr: "tenyearrate" }, { id: 5, name: "成立以来", abbr: "tenyearrate" }];

export default function FundListByYear() {

  var React = require('react');
  const [fundList, setFundList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFundListByYear(year[selectedYear].abbr, "混合型,股票型", 50, 0);
  }, [selectedYear]);

  async function getFundListByYear(year, type, pageSize, pageNumber) {
    setLoading(true)
    await axios.get(baseUrl + "/fund/api/rate/" + year + "/" + type + "?page=" + pageNumber + "&size=" + pageSize).then((response) => {
      setFundList(response.data.data.content);
    })
    setLoading(false)
  };

  return (
    <div><Typography sx={{ marginTop: '20px', marginLeft: '20px' }} variant="h3" gutterBottom>
      年限基金对比列表
    </Typography>
      <Select
        sx={{ marginLeft: "20px" }}
        value={selectedYear}
        label="统计年限"
        size='small'
        onChange={(event) => setSelectedYear(event.target.value)}
      >
        {year.map((row) => (
          <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>)
        )
        }
      </Select>
      {loading ? <div style={{ left: '50%', top: '50%', position: 'absolute' }}><CircularProgress /></div> : <div>

        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <Table size='small'>
              <TableHead sx={{ background: 'lightblue' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  {year.map((row) => (<TableCell key={row.id} align="right">{row.name}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {fundList ? fundList.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{(row.oneYearRate*100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{(row.threeYearRate*100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{(row.fiveYearRate*100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{(row.sevenYearRate*100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{(row.nineYearRate*100).toFixed(2)}%</TableCell>
                    <TableCell align="right">{(row.tenYearRate*100).toFixed(2)}%</TableCell>
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </CardContent>
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card></div>}
    </div>
  );
}