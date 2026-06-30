package utils

import (
	"os"

	"github.com/razorpay/razorpay-go"
)

var RazorpayClient *razorpay.Client

func InitRazorpay() {
	RazorpayClient = razorpay.NewClient(
		os.Getenv("RAZORPAY_KEY_ID"),
		os.Getenv("RAZORPAY_SECRET"),
	)
}
