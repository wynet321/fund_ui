import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Assessment as ChartIcon,
  CompareArrows as CompareIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <SearchIcon fontSize="large" />,
    title: '基金查询',
    description: '快速查找您感兴趣的基金，获取详细信息和历史数据',
    color: '#3B82F6', // Brighter blue
    path: '/search'
  },
  {
    icon: <ChartIcon fontSize="large" />,
    title: '基金图表',
    description: '可视化基金表现，分析趋势和模式',
    color: '#60A5FA', // Lighter blue
    path: '/chart'
  },
  {
    icon: <CompareIcon fontSize="large" />,
    title: '基金对比',
    description: '多只基金横向对比，助您做出明智决策',
    color: '#1D4ED8', // Darker blue
    path: '/comparison'
  }
];

const trendingFunds = [
  { id: 1, name: '天弘中证食品饮料ETF', code: '159736', change: 2.34, isPositive: true },
  { id: 2, name: '易方达蓝筹精选', code: '005827', change: -0.56, isPositive: false },
  { id: 3, name: '中欧医疗健康', code: '003095', change: 1.23, isPositive: true },
  { id: 4, name: '招商中证白酒', code: '161725', change: 0.45, isPositive: true },
];

const performanceMetrics = [
  { label: '总基金数量', value: '12,456', change: '5.2%', isPositive: true },
  { label: '平均年化收益', value: '8.7%', change: '1.1%', isPositive: true },
  { label: '用户数量', value: '1.2M+', change: '12.3%', isPositive: true },
];

const Homepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: '#F9FAFB' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', // Sky blue gradient
          color: 'white',
          pt: 12,
          pb: 15,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 40%)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                发现您的下一支优质基金
              </Typography>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                component="p"
                sx={{
                  maxWidth: '700px',
                  mx: 'auto',
                  textAlign: 'center',
                  opacity: 0.9,
                  mb: 4,
                  fontWeight: 400
                }}
              >
                专业基金数据分析平台，助您做出明智的投资决策
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  href="/search"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  开始探索
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  href="/comparison"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  基金对比
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, position: 'relative', mt: -8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, height: '100%' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}15`,
                          color: feature.color,
                          width: 60,
                          height: 60,
                          mb: 3,
                          '& svg': { fontSize: 32 }
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" component="h3" sx={{ mb: 1.5, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <Button
                        href={feature.path}
                        color="primary"
                        endIcon={<ArrowUpIcon />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 0,
                          '&:hover': { backgroundColor: 'transparent' }
                        }}
                      >
                        立即体验
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trending Funds */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              热门基金
            </Typography>
            <Typography variant="body1" color="text.secondary">
              当前市场表现优异的基金推荐
            </Typography>
          </Box>
          
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            {trendingFunds.map((fund, index) => (
              <React.Fragment key={fund.id}>
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2 }}>
                      <TrendingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {fund.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fund.code}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: fund.isPositive ? 'success.main' : 'error.main'
                    }}
                  >
                    {fund.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    <Typography variant="subtitle1" fontWeight={500}>
                      {fund.isPositive ? '+' : ''}{fund.change}%
                    </Typography>
                  </Box>
                </Box>
                {index < trendingFunds.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Paper>
        </Container>
      </Box>

      {/* Performance Metrics */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {metric.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, mr: 1 }}>
                      {metric.value}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: metric.isPositive ? 'success.main' : 'error.main',
                        bgcolor: metric.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {metric.isPositive ? '+' : ''}{metric.change}
                      {metric.isPositive ? <ArrowUpIcon sx={{ fontSize: '1rem', ml: 0.5 }} /> : <ArrowDownIcon sx={{ fontSize: '1rem', ml: 0.5 }} />}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      较上月
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
            开始您的投资之旅
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
            加入超过100万投资者，获取专业的基金分析工具和数据，助您做出更明智的投资决策。
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="/search"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
              }
            }}
          >
            免费开始使用
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
