import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Button,
  Chip,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
   Tooltip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';



import {
  People as UsersIcon,
  School as CoursesIcon,
  AttachMoney as TransactionsIcon,
  BarChart as AnalyticsIcon,
  Security as AdminIcon,
  Warning as ReportsIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Block as BlockedIcon,
  TrendingUp as GrowthIcon,
  MonetizationOn as EarningsIcon,
  Category as CategoriesIcon,
  Star as FeaturedIcon
} from '@mui/icons-material';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AdminChart from "../../components/AdminChart";

const DashboardAdmin = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    creators: 0,
    totalCourses: 0,
    pendingCourses: 0,
    transactions: 0,
    revenue: 0,
    loading: true
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!currentUser?.uid) return;

      try {
        // 1. Statistiques utilisateurs
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const creatorsQuery = query(collection(db, 'users'), where('role', '==', 'creator'));
        const creatorsSnapshot = await getDocs(creatorsQuery);

        // 2. Statistiques cours
        const coursesQuery = query(collection(db, 'courses'));
        const coursesSnapshot = await getDocs(coursesQuery);
        const pendingCoursesQuery = query(collection(db, 'courses'), where('status', '==', 'pending'));
        const pendingCoursesSnapshot = await getDocs(pendingCoursesQuery);

        // 3. Statistiques transactions (simulées)
        const totalTransactions = Math.floor(Math.random() * 500) + 100;
        const totalRevenue = (Math.random() * 20000 + 5000).toFixed(2);
        const newUsersLastWeek = Math.floor(Math.random() * 50) + 10;

        setStats({
          totalUsers: usersSnapshot.size,
          newUsers: newUsersLastWeek,
          creators: creatorsSnapshot.size,
          totalCourses: coursesSnapshot.size,
          pendingCourses: pendingCoursesSnapshot.size,
          transactions: totalTransactions,
          revenue: totalRevenue,
          loading: false
        });

        // 4. Charger les utilisateurs récents
        const usersData = usersSnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            status: ['active', 'pending', 'blocked'][Math.floor(Math.random() * 3)],
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }))
          .sort((a, b) => b.lastLogin - a.lastLogin)
          .slice(0, 5);
        
        setRecentUsers(usersData);

        // 5. Charger les cours en attente
        const pendingCoursesData = pendingCoursesSnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            creator: `Creator ${Math.floor(Math.random() * 100) + 1}`,
            createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
          }))
          .slice(0, 5);
        
        setPendingCourses(pendingCoursesData);

        // 6. Charger les transactions récentes (simulées)
        const transactionsData = Array.from({ length: 5 }, (_, i) => ({
          id: `trans_${i}`,
          amount: (Math.random() * 200 + 20).toFixed(2),
          user: `User ${Math.floor(Math.random() * 100) + 1}`,
          course: `Course ${Math.floor(Math.random() * 50) + 1}`,
          date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]
        }));
        
        setRecentTransactions(transactionsData);

      } catch (error) {
        console.error("Erreur de chargement admin:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAdminStats();
  }, [currentUser]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (stats.loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Style pour les cartes
  const cardStyle = {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[8]
    }
  };

  // Style pour les icônes
  const iconStyle = {
    fontSize: 40,
    mr: 2,
    p: 1.5,
    borderRadius: '50%',
    color: 'white'
  };

  // Style pour les boutons d'action
  const actionButtonStyle = {
    mt: 3,
    mb: 2,
    mr: 2,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: theme.shadows[2],
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active':
        return <ApprovedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'blocked':
        return <BlockedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          Tableau de bord Administrateur
        </Typography>
        
        <Box>
          <IconButton
            aria-label="more"
            aria-controls="admin-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            size="large"
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="admin-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
              <SettingsIcon sx={{ mr: 1 }} /> Paramètres
            </MenuItem>
            <MenuItem onClick={() => { navigate('/admin/reports'); handleMenuClose(); }}>
              <ReportsIcon sx={{ mr: 1 }} /> Rapports
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Boutons d'action rapide */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PeopleIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/admin/users')}
        >
          Gérer les utilisateurs
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<SchoolIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/admin/courses')}
        >
          Gérer les cours
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AttachMoneyIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/admin/transactions')}
        >
          Transactions
        </Button>
        <Button 
          variant="outlined" 
          color="warning" 
          startIcon={<ReportsIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/admin/reports')}
        >
          Signalements
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Carte: Utilisateurs totaux */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <UsersIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Utilisateurs totaux</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalUsers}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`+${stats.newUsers} cette semaine`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  icon={<TrendingUpIcon fontSize="small" />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Créateurs */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                  color: theme.palette.secondary.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Créateurs</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.creators}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => navigate('/admin/users?role=creator')}
                >
                  Voir tous
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Cours totaux */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CoursesIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  color: theme.palette.info.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Cours totaux</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalCourses}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Badge badgeContent={stats.pendingCourses} color="error" sx={{ mr: 2 }}>
                  <Typography variant="caption">En attente</Typography>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Revenus */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EarningsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  color: theme.palette.success.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Revenus totaux</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>€{stats.revenue}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${stats.transactions} transactions`} 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphique de croissance */}
      <Card elevation={3} sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Croissance de la plateforme
          </Typography>
          <AdminChart />
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Tableau: Utilisateurs récents */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Utilisateurs récents
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/users')}
                >
                  Voir tout
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell align="center">Rôle</TableCell>
                      <TableCell align="right">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        hover
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={user.photoURL} 
                              alt={user.displayName}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {user.displayName || user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={user.role || 'user'} 
                            size="small" 
                            color={user.role === 'admin' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={user.status}>
                            {getStatusIcon(user.status)}
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tableau: Cours en attente */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cours en attente d'approbation
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/courses?status=pending')}
                >
                  Voir tout
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cours</TableCell>
                      <TableCell align="center">Créateur</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingCourses.map((course) => (
                      <TableRow key={course.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {course.category}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {course.creator}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                            onClick={() => navigate(`/admin/courses/${course.id}/review`)}
                          >
                            Examiner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions récentes */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Transactions récentes
            </Typography>
            <Button 
              size="small" 
              onClick={() => navigate('/admin/transactions')}
            >
              Voir tout
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Transaction</TableCell>
                  <TableCell align="center">Montant</TableCell>
                  <TableCell align="center">Utilisateur</TableCell>
                  <TableCell align="center">Cours</TableCell>
                  <TableCell align="right">Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.id}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.date.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={500}>
                        €{transaction.amount}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {transaction.user}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {transaction.course}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={transaction.status} 
                        size="small"
                        color={
                          transaction.status === 'completed' ? 'success' : 
                          transaction.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Section d'actions rapides */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Gestion des utilisateurs
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/users')}
              >
                Liste des utilisateurs
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/users/new')}
              >
                Créer un admin
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ width: '100%' }}
                onClick={() => navigate('/admin/reports')}
              >
                Signalements
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon color="secondary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Gestion des cours
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/courses')}
              >
                Tous les cours
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/courses?status=pending')}
              >
                Cours en attente
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                sx={{ width: '100%' }}
                onClick={() => navigate('/admin/categories')}
              >
                Catégories
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOnIcon color="success" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Transactions & Revenus
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/transactions')}
              >
                Toutes les transactions
              </Button>
              <Button 
                variant="outlined" 
                color="success" 
                sx={{ mb: 1, width: '100%' }}
                onClick={() => navigate('/admin/payouts')}
              >
                Paiements créateurs
              </Button>
              <Button 
                variant="outlined" 
                color="success" 
                sx={{ width: '100%' }}
                onClick={() => navigate('/admin/revenue')}
              >
                Statistiques revenus
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAdmin;