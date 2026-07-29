-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 29, 2026 at 08:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tms`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `log_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_type` varchar(30) NOT NULL,
  `target_id` int(11) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`log_id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES
(1, 7, 'update_booking_status', 'booking', 10, 'Upcoming -> Completed', '2026-07-25 12:45:01'),
(2, 7, 'update_booking_status', 'booking', 14, 'Upcoming -> Cancelled', '2026-07-25 12:45:03'),
(3, 7, 'update_booking_status', 'booking', 11, 'Upcoming -> Completed', '2026-07-25 16:32:46'),
(4, 7, 'update_booking_status', 'booking', 12, 'Upcoming -> Completed', '2026-07-25 16:32:52'),
(5, 7, 'update_booking_status', 'booking', 19, 'Upcoming -> Completed', '2026-07-25 16:32:57'),
(6, 7, 'update_booking_status', 'booking', 18, 'Upcoming -> Completed', '2026-07-25 16:33:08'),
(7, 7, 'update_booking_status', 'booking', 17, 'Upcoming -> Completed', '2026-07-25 16:33:11'),
(8, 7, 'update_booking_status', 'booking', 16, 'Upcoming -> Completed', '2026-07-25 16:33:15'),
(9, 7, 'update_booking_status', 'booking', 15, 'Upcoming -> Cancelled', '2026-07-25 16:33:19'),
(10, 7, 'update_booking_status', 'booking', 13, 'Upcoming -> Cancelled', '2026-07-25 16:33:23'),
(11, 7, 'update_booking_status', 'booking', 9, 'Upcoming -> Completed', '2026-07-25 16:33:50'),
(12, 7, 'create_user', 'user', 10, 'role: traveler', '2026-07-25 17:51:44'),
(13, 7, 'delete_booking', 'booking', 8, NULL, '2026-07-26 09:09:49'),
(14, 7, 'update_booking_status', 'booking', 11, 'Completed -> Upcoming', '2026-07-26 09:10:11'),
(15, 7, 'update_booking_status', 'booking', 18, 'Completed -> Upcoming', '2026-07-27 10:27:12'),
(16, 7, 'update_booking_status', 'booking', 20, 'Upcoming -> Completed', '2026-07-27 10:27:15'),
(17, 7, 'update_booking_status', 'booking', 20, 'Completed -> Cancelled', '2026-07-27 10:44:57'),
(18, 7, 'update_booking_status', 'booking', 11, 'Upcoming -> Completed', '2026-07-27 12:53:59'),
(19, 7, 'update_booking_status', 'booking', 22, 'Upcoming -> Completed', '2026-07-29 05:38:56'),
(20, 7, 'update_booking_status', 'booking', 21, 'Upcoming -> Completed', '2026-07-29 05:38:59'),
(21, 7, 'update_booking_status', 'booking', 20, 'Cancelled -> Completed', '2026-07-29 05:39:02');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `booked_by` int(11) DEFAULT NULL,
  `booking_type` enum('Hotel','Transport') NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `transport_id` int(11) DEFAULT NULL,
  `travel_date` date NOT NULL,
  `seats` int(11) DEFAULT NULL,
  `nights` int(11) DEFAULT NULL,
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('Upcoming','Completed','Cancelled') DEFAULT 'Upcoming'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `guest_name`, `guest_email`, `guest_phone`, `booked_by`, `booking_type`, `hotel_id`, `transport_id`, `travel_date`, `seats`, `nights`, `booking_date`, `total_price`, `status`) VALUES
(4, 3, NULL, NULL, NULL, NULL, 'Hotel', 1, NULL, '2026-07-29', NULL, 1, '2026-07-18 05:12:15', 5000.00, 'Completed'),
(6, 3, NULL, NULL, NULL, NULL, 'Hotel', 1, NULL, '2026-07-28', NULL, 3, '2026-07-18 05:26:57', 15000.00, 'Completed'),
(7, 3, NULL, NULL, NULL, NULL, 'Transport', NULL, 3, '2026-07-30', 4, NULL, '2026-07-24 18:35:39', 3200.00, 'Completed'),
(9, 3, NULL, NULL, NULL, NULL, 'Hotel', 6, NULL, '2026-08-15', NULL, 2, '2026-07-25 10:41:14', 5600.00, 'Completed'),
(10, 8, NULL, NULL, NULL, NULL, 'Hotel', 10, NULL, '2026-07-28', NULL, 2, '2026-07-25 12:13:57', 8400.00, 'Completed'),
(11, 8, NULL, NULL, NULL, NULL, 'Transport', NULL, 7, '2026-07-28', 4, NULL, '2026-07-25 12:14:16', 34000.00, 'Completed'),
(12, 3, NULL, NULL, NULL, 1, 'Hotel', 11, NULL, '2026-09-01', NULL, 1, '2026-07-25 12:26:59', 3800.00, 'Completed'),
(13, NULL, 'Walk-in Guest', 'walkin@example.com', '01700000000', 1, 'Hotel', 11, NULL, '2026-09-02', NULL, 1, '2026-07-25 12:29:05', 3800.00, 'Cancelled'),
(14, NULL, 'Walk-in Guest', 'walkin@example.com', '01700000000', 1, 'Hotel', 11, NULL, '2026-09-02', NULL, 1, '2026-07-25 12:30:26', 3800.00, 'Cancelled'),
(15, 8, NULL, NULL, NULL, 1, 'Hotel', 13, NULL, '2026-07-30', NULL, 3, '2026-07-25 15:49:48', 18600.00, 'Cancelled'),
(16, NULL, 'Putul', '', '', 1, 'Transport', NULL, 7, '2026-07-30', 2, NULL, '2026-07-25 15:52:52', 17000.00, 'Completed'),
(17, 3, NULL, NULL, NULL, NULL, 'Transport', NULL, 6, '2026-10-02', 1, NULL, '2026-07-25 16:17:00', 950.00, 'Completed'),
(18, 3, NULL, NULL, NULL, NULL, 'Transport', NULL, 6, '2026-10-02', 1, NULL, '2026-07-25 16:19:10', 950.00, 'Upcoming'),
(19, 3, NULL, NULL, NULL, NULL, 'Transport', NULL, 7, '2026-10-02', 7, NULL, '2026-07-25 16:28:37', 59500.00, 'Completed'),
(20, NULL, 'Lita', '', '', 1, 'Hotel', 13, NULL, '2026-07-28', NULL, 3, '2026-07-27 10:26:12', 18600.00, 'Completed'),
(21, 8, NULL, NULL, NULL, NULL, 'Hotel', 11, NULL, '2026-07-31', NULL, 3, '2026-07-29 05:14:46', 11400.00, 'Completed'),
(22, 8, NULL, NULL, NULL, NULL, 'Transport', NULL, 7, '2026-07-31', 1, NULL, '2026-07-29 05:15:58', 8500.00, 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `message_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `subject` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`message_id`, `name`, `email`, `subject`, `message`, `submitted_at`) VALUES
(1, 'Sadia Morshed', 'sadia@example.com', 'Hotel Inquiry', 'Do you have hotels available in Cox\'s Bazar next weekend?', '2026-07-21 13:12:04'),
(2, 'Rahim Uddin', 'rahim@gmail.com', 'Booking Issue', 'I accidentally booked the wrong hotel. Please help me cancel it.', '2026-07-21 13:12:04'),
(3, 'Nusrat Jahan', 'nusrat@yahoo.com', 'Transport Information', 'Are AC buses available from Dhaka to Bandarban?', '2026-07-21 13:12:04');

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `hotel_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `hotel_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(150) NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `available_rooms` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Available','Unavailable') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`hotel_id`, `provider_id`, `hotel_name`, `description`, `location`, `price_per_night`, `rating`, `available_rooms`, `image`, `status`, `created_at`) VALUES
(1, 1, 'Sunset Beach Resort', 'Beachfront resort offering sea-view rooms, swimming pool, restaurant, free WiFi, and family-friendly facilities.', 'Cox\'s Bazar', 5000.00, 4.5, 4, 'https://picsum.photos/seed/hotel1/600/400', 'Available', '2026-07-05 14:21:06'),
(3, 1, 'Hillview Retreat', 'Peaceful hillside retreat surrounded by lush greenery, featuring comfortable rooms and panoramic mountain views.', 'Sylhet', 3500.00, 4.2, 10, 'https://picsum.photos/seed/hotel2/600/400', 'Unavailable', '2026-07-05 14:26:49'),
(6, 2, 'City Comfort Inn', 'Affordable business hotel located in central Dhaka with modern amenities and easy access to commercial areas.', 'Dhaka', 2800.00, 4.0, 14, 'https://picsum.photos/seed/hotel3/600/400', 'Available', '2026-07-05 14:26:54'),
(8, 1, 'Pan Pacific Sonargaon', 'Luxury five-star hotel in the heart of Dhaka offering premium accommodation, restaurants, spa, swimming pool, fitness center, and conference facilities.', 'Dhaka', 12000.00, 4.8, 50, 'https://picsum.photos/seed/panpacific/600/400', 'Available', '2026-07-25 09:41:38'),
(9, 1, 'Ocean Paradise Resort', 'Luxury beachfront resort with sea view rooms.', 'Cox\'s Bazar', 7500.00, 4.8, 18, 'https://upload.wikimedia.org/wikipedia/commons/8/89/Ocean_Paradise_Hotel_%26_Resort_Cox%27s_Bazar.jpg', 'Available', '2026-07-25 10:58:10'),
(10, 2, 'Royal Heritage Hotel', 'Elegant hotel located near historical attractions.', 'Rajshahi', 4200.00, 4.3, 14, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Available', '2026-07-25 10:58:10'),
(11, 1, 'Tea Garden Lodge', 'Peaceful accommodation surrounded by tea gardens.', 'Sylhet', 3800.00, 4.4, 16, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c', 'Available', '2026-07-25 10:58:10'),
(12, 2, 'Sea Pearl Inn', 'Comfortable hotel within walking distance of the beach.', 'Kuakata', 4600.00, 4.2, 12, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'Available', '2026-07-25 10:58:10'),
(13, 1, 'Hill Crown Resort', 'Modern resort with panoramic hill views.', 'Bandarban', 6200.00, 4.7, 8, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 'Available', '2026-07-25 10:58:10');

-- --------------------------------------------------------

--
-- Table structure for table `itineraries`
--

CREATE TABLE `itineraries` (
  `itinerary_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `destination` varchar(100) DEFAULT NULL,
  `travel_days` int(11) DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `travel_style` varchar(50) DEFAULT NULL,
  `preferences` varchar(255) DEFAULT NULL,
  `itinerary` mediumtext DEFAULT NULL COMMENT 'JSON: the latest structured itinerary (days, budget breakdown, tips)',
  `messages` mediumtext DEFAULT NULL COMMENT 'JSON: full chat history [{role, content}]',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `itineraries`
--

INSERT INTO `itineraries` (`itinerary_id`, `user_id`, `title`, `destination`, `travel_days`, `budget`, `travel_style`, `preferences`, `itinerary`, `messages`, `created_at`, `updated_at`) VALUES
(1, 1, 'Beach Escape', 'Cox\'s Bazar', 3, 15000.00, NULL, NULL, 'Day 1: Laboni Beach. Day 2: Himchari & Inani. Day 3: Marine Drive.', NULL, '2026-07-21 13:16:37', '2026-07-28 12:03:39'),
(2, 1, 'Nature Tour', 'Sylhet', 2, 12000.00, NULL, NULL, 'Visit Ratargul, Jaflong and Tea Garden.', NULL, '2026-07-21 13:16:37', '2026-07-28 12:03:39'),
(3, 2, 'Adventure Trip', 'Bandarban', 3, 18000.00, NULL, NULL, 'Nilgiri, Chimbuk and Boga Lake.', NULL, '2026-07-21 13:16:37', '2026-07-28 12:03:39'),
(4, 1, 'Dhaka Trip', 'Dhaka', 3, 2000.00, 'luxury', NULL, 'Day 1: Explore Dhaka — a premium day with upscale dining and comfort. Suggested spend: ~667 BDT (stay, food, local transport, sightseeing).\nDay 2: Explore Dhaka — a premium day with upscale dining and comfort. Suggested spend: ~667 BDT (stay, food, local transport, sightseeing).\nDay 3: Explore Dhaka — a premium day with upscale dining and comfort. Suggested spend: ~667 BDT (stay, food, local transport, sightseeing).', NULL, '2026-07-27 12:31:06', '2026-07-28 12:03:39'),
(5, 8, 'Kuakata Trip', 'Kuakata', 2, 2000.00, 'relaxed', NULL, 'Day 1: Explore Kuakata — a slow-paced day with plenty of downtime. Suggested spend: ~1000 BDT (stay, food, local transport, sightseeing).\nDay 2: Explore Kuakata — a slow-paced day with plenty of downtime. Suggested spend: ~1000 BDT (stay, food, local transport, sightseeing).', NULL, '2026-07-27 12:38:22', '2026-07-28 12:03:39'),
(6, 8, 'Barishal Trip', 'Barishal', 1, 1300.00, 'balanced', 'Nightlife', '{\"destination\":\"Barishal\",\"days\":1,\"budget\":1300,\"style\":\"balanced\",\"preferences\":[\"Nightlife\"],\"day_plans\":[{\"day\":1,\"title\":\"Exploring Barishal\",\"morning\":\"Start your day with a visit to the Durga Sagor Lake and take a boat ride. Then, head to the Barishal University Campus, a famous and beautiful place to explore.\",\"afternoon\":\"Head to the Barishal Museum to learn about the history and culture of the city. Then, take a walk along the riverbank and enjoy the local street food.\",\"evening\":\"Enjoy the city\'s nightlife by visiting the Kazir Deuri or other local bars and cafes. You can also explore the Oxford Mission Church, a famous landmark in the city.\",\"accommodation\":\"Hotel Abhi\",\"estimated_cost\":900}],\"budget_breakdown\":{\"accommodation\":500,\"food\":300,\"transport\":100,\"activities\":400},\"tips\":[\"Don\'t forget to try the local cuisine, especially the fish dishes.\",\"Be respectful of the local culture and environment.\"]}', '[{\"role\":\"user\",\"content\":\"Plan a 1-day balanced trip to Barishal with a budget of 1300 BDT. I\'m especially interested in Nightlife.\"},{\"role\":\"assistant\",\"content\":\"I\'d be happy to help you plan your trip to Barishal. Given your interest in nightlife, I\'ve included some exciting activities for the evening. Here\'s your balanced 1-day itinerary. Have a great trip!\",\"source\":\"groq\"},{\"role\":\"user\",\"content\":\"include famous places as well\"},{\"role\":\"assistant\",\"content\":\"I\'ve added some famous places to your 1-day trip to Barishal, along with exciting nightlife activities. Here\'s your updated itinerary. Have a great trip!\",\"source\":\"groq\"}]', '2026-07-29 05:36:07', '2026-07-29 05:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `transport_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `review` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `provider_response` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `booking_id`, `user_id`, `hotel_id`, `transport_id`, `rating`, `review`, `status`, `provider_response`, `reviewed_by`, `reviewed_at`, `created_at`) VALUES
(1, 4, 3, 1, NULL, 5, 'Excellent hotel with great service.', 'Approved', NULL, NULL, NULL, '2026-07-21 13:21:02'),
(2, 6, 3, 1, NULL, 4, 'Comfortable rooms and friendly staff.', 'Approved', NULL, NULL, NULL, '2026-07-21 13:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `transport`
--

CREATE TABLE `transport` (
  `transport_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `vehicle_type` enum('Bus','Train','Flight','Car') NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `source` varchar(100) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `departure_time` datetime DEFAULT NULL,
  `arrival_time` datetime DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `available_seats` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Available','Unavailable') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transport`
--

INSERT INTO `transport` (`transport_id`, `provider_id`, `vehicle_type`, `company_name`, `source`, `destination`, `departure_time`, `arrival_time`, `price`, `available_seats`, `image`, `status`, `created_at`) VALUES
(1, 2, 'Bus', 'Green Line', 'Dhaka', 'Cox\'s Bazaar', '2026-08-08 08:00:00', '2026-08-08 16:30:00', 1300.00, 40, 'https://picsum.photos/seed/bus1/600/400', 'Available', '2026-07-05 14:29:45'),
(2, 2, 'Flight', 'US-Bangla', 'Dhaka', 'Sylhet', '2026-08-09 09:15:00', '2026-08-09 10:10:00', 4500.00, 100, 'https://picsum.photos/seed/flight1/600/400', 'Available', '2026-07-05 14:29:45'),
(3, 1, 'Train', 'Bangladesh Railway', 'Dhaka', 'Chittagong', '2026-08-10 07:15:00', '2026-08-10 13:45:00', 800.00, 56, 'https://picsum.photos/seed/train1/600/400', 'Available', '2026-07-05 14:32:12'),
(4, 2, 'Bus', 'Shohag Paribahan', 'Dhaka', 'Sylhet', '2026-08-10 07:30:00', '2026-08-10 13:30:00', 1200.00, 35, 'https://upload.wikimedia.org/wikipedia/commons/3/36/Shohag_Paribahan_Bus.jpg', 'Available', '2026-07-25 10:58:58'),
(5, 1, 'Flight', 'Biman Bangladesh Airlines', 'Dhaka', 'Cox\'s Bazar', '2026-08-11 09:00:00', '2026-08-11 10:00:00', 5500.00, 85, 'https://upload.wikimedia.org/wikipedia/commons/0/06/Biman_Bangladesh_Airlines_Boeing_787-8.jpg', 'Available', '2026-07-25 10:58:58'),
(6, 2, 'Train', 'Bangladesh Railway', 'Dhaka', 'Rajshahi', '2026-08-12 06:45:00', '2026-08-12 13:15:00', 950.00, 85, 'https://upload.wikimedia.org/wikipedia/commons/5/58/Bangladesh_Railway_Intercity_Train.jpg', 'Available', '2026-07-25 10:58:58'),
(7, 1, 'Car', 'TravelX Rent A Car', 'Dhaka', 'Bandarban', '2026-08-13 08:00:00', '2026-08-13 16:00:00', 8500.00, 10, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', 'Available', '2026-07-25 10:58:58'),
(8, 2, 'Bus', 'Hanif Enterprise', 'Dhaka', 'Kuakata', '2026-08-14 22:00:00', '2026-08-15 07:00:00', 1800.00, 42, 'https://upload.wikimedia.org/wikipedia/commons/7/79/Hanif_Enterprise_Bus.jpg', 'Available', '2026-07-25 10:58:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('traveler','provider','admin') NOT NULL DEFAULT 'traveler',
  `profile_image` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `password`, `role`, `profile_image`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Sunset Resorts Ltd', 'provider1@test.com', NULL, '$2y$10$zdyExTHB9IxvYd.eXICnh.Er0DWZSVjgzvcb.sAwyJnVmyAx6q2TO', 'provider', NULL, NULL, '2026-07-05 14:16:17', '2026-07-05 15:16:50'),
(2, 'Green Line Travels', 'provider2@test.com', NULL, '$2y$10$Dn0ehMrij2lVtZGjemUm0O9ez8yLebYKprv8VSBDtepfHNTaGg5fS', 'provider', NULL, NULL, '2026-07-05 14:16:17', '2026-07-05 15:16:50'),
(3, 'Test Traveler', 'traveler@test.com', '1234568', '$2y$10$mPvDYZmgUTahD3y8d2txK.tm13c69nTxTNx.wwiyFVYgic1ySUSya', 'traveler', NULL, 'Hello', '2026-07-05 14:16:17', '2026-07-24 18:32:08'),
(7, 'admin', 'admin@test.com', NULL, '$2y$10$53hXb6dQ6wWcE.dU5GSf6uuGDvjoXGz2AYHG5HWWuGJX/9gqJHMuq', 'admin', NULL, NULL, '2026-07-05 15:01:00', '2026-07-05 15:30:54'),
(8, 'Samiha', 'samiha@test.com', '122344', '$2y$10$9woAsc5ySHas7iesddWE8OGPlsAT6Dz9AVts3CqyIi7hkHjSVQaE6', 'traveler', NULL, 'Hello', '2026-07-25 10:23:06', '2026-07-25 10:23:06'),
(9, 'Maliha', 'maliha@gmail.com', '', '$2y$10$Xk6Xqdt6RdYbRMrRn4H.huc7ZXqhd2Sh896EFKwciITPkrnbNa9gG', 'traveler', NULL, NULL, '2026-07-25 17:44:11', '2026-07-25 17:44:11'),
(10, 'Putul', 'putul@gmail.com', '', '$2y$10$NCzT./6dlYVANxxIWH01SuU2oRk8UXVCcYduO0lo1mNJiN/8/LPn.', 'traveler', NULL, '', '2026-07-25 17:51:44', '2026-07-25 17:51:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `hotel_id` (`hotel_id`),
  ADD KEY `transport_id` (`transport_id`),
  ADD KEY `bookings_booked_by_fk` (`booked_by`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`hotel_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `itineraries`
--
ALTER TABLE `itineraries`
  ADD PRIMARY KEY (`itinerary_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `hotel_id` (`hotel_id`),
  ADD KEY `transport_id` (`transport_id`),
  ADD KEY `reviews_reviewed_by_fk` (`reviewed_by`);

--
-- Indexes for table `transport`
--
ALTER TABLE `transport`
  ADD PRIMARY KEY (`transport_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `hotel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `itineraries`
--
ALTER TABLE `itineraries`
  MODIFY `itinerary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transport`
--
ALTER TABLE `transport`
  MODIFY `transport_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_booked_by_fk` FOREIGN KEY (`booked_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`transport_id`) REFERENCES `transport` (`transport_id`) ON DELETE SET NULL;

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `itineraries`
--
ALTER TABLE `itineraries`
  ADD CONSTRAINT `itineraries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`transport_id`) REFERENCES `transport` (`transport_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_reviewed_by_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `transport`
--
ALTER TABLE `transport`
  ADD CONSTRAINT `transport_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
