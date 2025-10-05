import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { 
  FaClock, 
  FaDownload, 
  FaCopy, 
  FaQrcode, 
  FaDollarSign,
  FaPaypal,
  FaMobileAlt,
  FaExclamationTriangle,
  FaHistory,
  FaCheck,
  FaTimes,
  FaTrash,
  FaSpinner
} from 'react-icons/fa'

const PAYPAL_USERNAME = 'NamSunny197'
const QR_EXPIRY_TIME = 3600 // 1 hour in seconds
const MAX_HISTORY_ITEMS = 20
const MAX_RECENT_AMOUNTS = 8

function App() {
  const [amount, setAmount] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('input') // 'input', 'qr', or 'history'
  const [recentAmounts, setRecentAmounts] = useState([])
  const [qrHistory, setQrHistory] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [inputError, setInputError] = useState('')
  const qrRef = useRef(null)
  const amountInputRef = useRef(null)

  const presetAmounts = [10, 25, 50, 100, 200, 500]

  // localStorage functions
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const loadFromLocalStorage = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return defaultValue
    }
  }

  const addToRecentAmounts = (amount) => {
    if (!amount || amount === '') return
    
    const newRecentAmounts = [amount, ...recentAmounts.filter(a => a !== amount)]
      .slice(0, MAX_RECENT_AMOUNTS)
    
    setRecentAmounts(newRecentAmounts)
    saveToLocalStorage('paypal_recent_amounts', newRecentAmounts)
  }

  const addToQrHistory = (amount, url) => {
    const historyItem = {
      amount,
      url,
      timestamp: Date.now(),
      id: Date.now()
    }
    
    const newHistory = [historyItem, ...qrHistory].slice(0, MAX_HISTORY_ITEMS)
    setQrHistory(newHistory)
    saveToLocalStorage('paypal_qr_history', newHistory)
  }

  const clearHistory = () => {
    setQrHistory([])
    setRecentAmounts([])
    localStorage.removeItem('paypal_qr_history')
    localStorage.removeItem('paypal_recent_amounts')
  }

  const showSuccessNotification = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const generatePayPalUrl = (amount) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return ''
    }
    return `https://paypal.me/${PAYPAL_USERNAME}/${amount}`
  }

  const generateQRCode = async (url, amount) => {
    if (!url) return
    
    setIsGenerating(true)
    setInputError('')
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#003087',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
      setTimeLeft(QR_EXPIRY_TIME)
      setIsExpired(false)
      
      // Add to history
      addToRecentAmounts(amount)
      addToQrHistory(amount, url)
      
      showSuccessNotification('QR Code đã được tạo thành công!')
    } catch (error) {
      console.error('Error generating QR code:', error)
      setInputError('Có lỗi xảy ra khi tạo QR code. Vui lòng thử lại.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    setInputError('')
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGenerateQR()
    }
  }

  const handleGenerateQR = () => {
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setInputError('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)')
      return
    }
    
    const url = generatePayPalUrl(amount)
    if (url) {
      generateQRCode(url, amount)
      setActiveTab('qr')
    }
  }

  const handlePresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString())
    setInputError('')
  }

  const handleRecentAmount = (recentAmount) => {
    setAmount(recentAmount)
    setInputError('')
  }

  const copyToClipboard = async () => {
    const url = generatePayPalUrl(amount)
    if (url) {
      try {
        await navigator.clipboard.writeText(url)
        showSuccessNotification('URL đã được copy vào clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
        setInputError('Không thể copy URL. Vui lòng thử lại.')
      }
    }
  }

  const copyUrlFromHistory = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      showSuccessNotification('URL đã được copy vào clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadQR = async () => {
    if (qrRef.current && qrCodeUrl) {
      try {
        const canvas = await html2canvas(qrRef.current)
        const link = document.createElement('a')
        link.download = `paypal-qr-${amount}-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
        showSuccessNotification('QR Code đã được tải xuống!')
      } catch (error) {
        console.error('Error downloading QR code:', error)
        setInputError('Không thể tải xuống QR code. Vui lòng thử lại.')
      }
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRecentAmounts = loadFromLocalStorage('paypal_recent_amounts', [])
    const savedQrHistory = loadFromLocalStorage('paypal_qr_history', [])
    
    setRecentAmounts(savedRecentAmounts)
    setQrHistory(savedQrHistory)
    
    // Auto-focus on amount input
    if (amountInputRef.current) {
      amountInputRef.current.focus()
    }
  }, [])

  // Timer effect
  useEffect(() => {
    let timer
    if (timeLeft > 0 && !isExpired) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsExpired(true)
            setQrCodeUrl('')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timeLeft, isExpired])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((QR_EXPIRY_TIME - timeLeft) / QR_EXPIRY_TIME) * 100
  }

  const getTimerColor = () => {
    const percentage = getProgressPercentage()
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const paypalUrl = generatePayPalUrl(amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-paypal-blue to-paypal-darkblue p-6 text-white">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <FaPaypal className="text-3xl" />
            <h1 className="text-2xl font-bold">PayPal QR Generator</h1>
          </div>
          <p className="text-center text-blue-100">Tạo QR code thanh toán PayPal</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'input'
                ? 'text-paypal-blue border-b-2 border-paypal-blue bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaDollarSign />
            <span className="hidden sm:inline">Nhập số tiền</span>
            <span className="sm:hidden">Nhập</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'qr'
                ? 'text-paypal-blue border-b-2 border-paypal-blue bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaQrcode />
            <span className="hidden sm:inline">QR Code</span>
            <span className="sm:hidden">QR</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'history'
                ? 'text-paypal-blue border-b-2 border-paypal-blue bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaHistory />
            <span className="hidden sm:inline">Lịch sử</span>
            <span className="sm:hidden">Sử</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Username
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-paypal-blue font-semibold text-lg">@</span>
                  <span className="text-lg font-bold text-gray-800">{PAYPAL_USERNAME}</span>
                </div>
              </div>

              {/* Recent Amounts */}
              {/* {recentAmounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Số tiền gần đây
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {recentAmounts.slice(0, 4).map((recentAmount) => (
                      <button
                        key={recentAmount}
                        onClick={() => handleRecentAmount(recentAmount)}
                        className={`py-2 px-3 rounded-lg border transition-all duration-200 text-sm ${
                          amount === recentAmount
                            ? 'bg-green-500 text-white border-green-500 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300'
                        }`}
                      >
                        ${recentAmount}
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn số tiền (USD)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {presetAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => handlePresetAmount(presetAmount)}
                      className={`py-3 px-4 rounded-lg border transition-all duration-200 font-medium ${
                        amount === presetAmount.toString()
                          ? 'bg-paypal-blue text-white border-paypal-blue shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-paypal-blue hover:shadow-sm'
                      }`}
                    >
                      ${presetAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập số tiền tùy chỉnh
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      ref={amountInputRef}
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập số tiền..."
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-paypal-blue focus:border-transparent outline-none transition-all duration-200 ${
                        inputError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <button
                      onClick={handleGenerateQR}
                      disabled={!amount || isGenerating}
                      className="px-6 py-3 bg-paypal-blue text-white rounded-lg hover:bg-paypal-darkblue disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      {isGenerating ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Đang tạo...</span>
                        </>
                      ) : (
                        <>
                          <FaQrcode />
                          <span>Tạo QR</span>
                        </>
                      )}
                    </button>
                  </div>
                  {inputError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <FaTimes />
                      <span>{inputError}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Nhấn Enter để tạo QR code nhanh
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-6">
              {timeLeft > 0 && !isExpired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        QR Code expires in:
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${getTimerColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="timer-progress h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FaExclamationTriangle className="text-red-600" />
                    <p className="text-red-800 font-medium">
                      QR Code đã hết hạn! Vui lòng tạo mới.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('input')}
                    className="mt-2 px-4 py-2 bg-paypal-blue text-white rounded-lg hover:bg-paypal-darkblue transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <FaQrcode />
                    <span>Tạo QR mới</span>
                  </button>
                </div>
              )}

              {qrCodeUrl && !isExpired && (
                <div className="text-center">
                  <div ref={qrRef} className="inline-block p-6 bg-white rounded-xl shadow-xl border border-gray-200">
                    <img src={qrCodeUrl} alt="PayPal QR Code" className="w-64 h-64" />
                    {/* <div className="mt-3 text-sm text-gray-600">
                      <p className="font-medium">Số tiền: ${amount}</p>
                      <p className="text-xs text-gray-500">@paypal.me/{PAYPAL_USERNAME}</p>
                    </div> */}
                  </div>
                  <div className="mt-6 space-x-3 flex justify-center">
                    <button
                      onClick={downloadQR}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <FaDownload />
                      <span>Download QR</span>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <FaCopy />
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              )}

              {!qrCodeUrl && !isExpired && (
                <div className="text-center py-12">
                  <FaMobileAlt className="text-gray-400 text-6xl mb-4 mx-auto" />
                  <p className="text-gray-500 text-lg">Chưa có QR code</p>
                  <p className="text-gray-400 text-sm mt-2">Vui lòng quay lại tab "Nhập số tiền" để tạo QR code</p>
                  <button
                    onClick={() => setActiveTab('input')}
                    className="mt-4 px-6 py-2 bg-paypal-blue text-white rounded-lg hover:bg-paypal-darkblue transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <FaQrcode />
                    <span>Tạo QR Code</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Lịch sử QR Codes</h3>
                {qrHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FaTrash />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>

              {qrHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="text-gray-400 text-6xl mb-4 mx-auto" />
                  <p className="text-gray-500 text-lg">Chưa có lịch sử</p>
                  <p className="text-gray-400 text-sm mt-2">Tạo QR code đầu tiên để xem lịch sử ở đây</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {qrHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-paypal-blue text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              ${item.amount}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">${item.amount} USD</p>
                              <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyUrlFromHistory(item.url)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          >
                            <FaCopy />
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={() => {
                              setAmount(item.amount)
                              setActiveTab('input')
                            }}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
                          >
                            <FaQrcode />
                            <span>Tạo lại</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentAmounts.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Số tiền thường dùng</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {recentAmounts.map((recentAmount) => (
                      <button
                        key={recentAmount}
                        onClick={() => {
                          setAmount(recentAmount)
                          setActiveTab('input')
                        }}
                        className="py-2 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-paypal-blue transition-all duration-200 text-sm"
                      >
                        ${recentAmount}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-in-right">
            <FaCheck />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
