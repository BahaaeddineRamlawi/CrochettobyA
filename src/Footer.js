import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons";
import {
  faMapLocationDot,
  faMoneyBill1Wave
} from "@fortawesome/free-solid-svg-icons";
import "./style/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="contact-info">
        <p>
          <FontAwesomeIcon icon={faMapLocationDot} />
          Delivery: <span>ONLY</span> in Saida District
        </p>
        <p>
          <FontAwesomeIcon icon={faMoneyBill1Wave} />
          Cash on delivery
        </p>
        <p>
          <FontAwesomeIcon icon={faSquareInstagram} />
          Instagram:{" "}
          <a
            href="https://www.instagram.com/crochetto_by_a/"
            target="_blank"
            rel="noopener noreferrer"
          >
            @crochetto_by_a
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
