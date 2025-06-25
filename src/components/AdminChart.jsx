import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', users: 400, courses: 240, revenue: 2400 },
  { name: 'Fév', users: 600, courses: 320, revenue: 3200 },
  { name: 'Mar', users: 800, courses: 400, revenue: 4000 },
  { name: 'Avr', users: 1200, courses: 480, revenue: 4800 },
  { name: 'Mai', users: 1600, courses: 580, revenue: 5800 },
  { name: 'Juin', users: 2000, courses: 680, revenue: 6800 },
  { name: 'Juil', users: 2400, courses: 780, revenue: 7800 },
];

const AdminChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="courses" stroke="#82ca9d" />
        <Line type="monotone" dataKey="revenue" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AdminChart;