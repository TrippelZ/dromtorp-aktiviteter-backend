SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `activities` (
  `activityID` bigint(255) NOT NULL,
  `activityName` varchar(1024) NOT NULL,
  `activityDescription` varchar(2048) NOT NULL,
  `activityDate` datetime NOT NULL,
  `activityHost` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `activity_signups` (
  `signupID` bigint(255) NOT NULL,
  `activity` bigint(255) NOT NULL,
  `user` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `userID` bigint(255) NOT NULL,
  `firstName` varchar(1024) NOT NULL,
  `lastName` varchar(1024) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(389) NOT NULL,
  `permissionLevel` tinyint(2) NOT NULL,
  `loginTime` varchar(99) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `activities`
  ADD PRIMARY KEY (`activityID`);

ALTER TABLE `activity_signups`
  ADD PRIMARY KEY (`signupID`),
  ADD KEY `user_FK` (`user`),
  ADD KEY `activity_FK` (`activity`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

ALTER TABLE `activities`
  MODIFY `activityID` bigint(255) NOT NULL AUTO_INCREMENT;

ALTER TABLE `activity_signups`
  MODIFY `signupID` bigint(255) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `userID` bigint(255) NOT NULL AUTO_INCREMENT;

ALTER TABLE `activity_signups`
  ADD CONSTRAINT `activity_FK` FOREIGN KEY (`activity`) REFERENCES `activities` (`activityID`),
  ADD CONSTRAINT `user_FK` FOREIGN KEY (`user`) REFERENCES `users` (`userID`);
COMMIT;
