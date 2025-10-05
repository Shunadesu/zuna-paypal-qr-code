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
  FaExclamationTriangle
} from 'react-icons/fa'

const PAYPAL_USERNAME = 'NamSunny197'
const QR_EXPIRY_TIME = 3600 // 1 hour in seconds

function App() {
  const [amount, setAmount] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('input') // 'input' or 'qr'
  const qrRef = useRef(null)

  const presetAmounts = [10, 25, 50, 100, 200, 500]

  const generatePayPalUrl = (amount) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return ''
    }
    return `https://paypal.me/${PAYPAL_USERNAME}/${amount}`
  }

  const generateQRCode = async (url) => {
    if (!url) return
    
    setIsGenerating(true)
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
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleGenerateQR = () => {
    const url = generatePayPalUrl(amount)
    if (url) {
      generateQRCode(url)
      setActiveTab('qr')
    }
  }

  const handlePresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString())
  }

  const copyToClipboard = async () => {
    const url = generatePayPalUrl(amount)
    if (url) {
      try {
        await navigator.clipboard.writeText(url)
        alert('URL đã được copy vào clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
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
      } catch (error) {
        console.error('Error downloading QR code:', error)
      }
    }
  }

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
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'input'
                ? 'text-paypal-blue border-b-2 border-paypal-blue bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaDollarSign />
            <span>Nhập số tiền</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'qr'
                ? 'text-paypal-blue border-b-2 border-paypal-blue bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaQrcode />
            <span>QR Code</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Username
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-paypal-blue font-semibold">@</span>
                  <span className="text-lg font-bold text-gray-800">{PAYPAL_USERNAME}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn số tiền nhanh (USD)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {presetAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => handlePresetAmount(presetAmount)}
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        amount === presetAmount.toString()
                          ? 'bg-paypal-blue text-white border-paypal-blue'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      ${presetAmount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc nhập số tiền tùy chỉnh
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Nhập số tiền..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-paypal-blue focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleGenerateQR}
                    disabled={!amount || isGenerating}
                    className="px-6 py-3 bg-paypal-blue text-white rounded-lg hover:bg-paypal-darkblue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? 'Đang tạo...' : 'Tạo QR'}
                  </button>
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
                  <div ref={qrRef} className="inline-block p-4 bg-white rounded-lg shadow-lg">
                    <img src={qrCodeUrl} alt="PayPal QR Code" className="w-64 h-64" />
                  </div>
                  <div className="mt-4 space-x-2 flex justify-center">
                    <button
                      onClick={downloadQR}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <FaDownload />
                      <span>Download QR</span>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
        </div>
      </div>
    </div>
  )
}

export default App
