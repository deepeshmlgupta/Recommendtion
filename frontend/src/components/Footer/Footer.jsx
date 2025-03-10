import React from 'react'
import './Footer.css'
import youtube_icon from '../../Assets/youtube_icon.png'
import faceboot_icon from '../../Assets/facebook_icon.png'
import instagram_icon from '../../Assets/instagram_icon.png'
import twitter_icon from '../../Assets/twitter_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-icons">
        <img src={youtube_icon} alt="" />
        <img src={faceboot_icon} alt="" />
        <img src={instagram_icon} alt="" />
        <img src={twitter_icon} alt="" />
      </div>
      <ul>
        <li>Contact</li>
        <li>Help</li>
        <li>Media Center</li>
        <li>Terms & Conditions</li>
        <li>Privacy</li>
        <li>Cookies</li>
        <li>Career</li>
      </ul>
      <p className='copyright-text'>@ All Right Reserved By Deepesh Gupta, 2024</p>

    </div>
  )
}

export default Footer