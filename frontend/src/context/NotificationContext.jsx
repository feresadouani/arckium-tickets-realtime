/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '../config/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const socketRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: notification.id ?? `n-${Date.now()}`,
        read: notification.read ?? false,
        timestamp: notification.timestamp ?? new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join', { userId: user.id, role: user.role === 'manager' ? 'responsable' : user.role === 'technician' ? 'technicien' : user.role })
    })

    socket.on('notification', (payload) => {
      addNotification(payload)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user, addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        panelOpen,
        setPanelOpen,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
