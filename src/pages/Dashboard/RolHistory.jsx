import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const getActionIcon = (action) => {
  switch (action) {
    case 'create':
      return <AddIcon color="success" />;
    case 'update':
      return <EditIcon color="primary" />;
    case 'delete':
      return <DeleteIcon color="error" />;
    default:
      return null;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'create':
      return 'success';
    case 'update':
      return 'primary';
    case 'delete':
      return 'error';
    default:
      return 'default';
  }
};

const RoleHistoryDialog = ({ open, onClose, history }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Historial de Cambios</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {history.map((record, index) => (
            <React.Fragment key={record.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {getActionIcon(record.action)}
                      <Typography variant="subtitle1">
                        {record.roleName}
                      </Typography>
                      <Chip
                        label={record.action.toUpperCase()}
                        size="small"
                        color={getActionColor(record.action)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography component="span" variant="body2" color="text.primary">
                        {record.user} - {new Date(record.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.description}
                      </Typography>
                      {record.changes && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Cambios realizados:
                          </Typography>
                          <ul style={{ margin: '4px 0' }}>
                            {Object.entries(record.changes).map(([key, value]) => (
                              <li key={key}>
                                <Typography variant="body2" color="text.secondary">
                                  {key}: {value.from} → {value.to}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < history.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default RoleHistoryDialog;