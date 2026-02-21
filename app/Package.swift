// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "WeMeal",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "WeMeal",
            targets: ["WeMeal"]),
    ],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0")
    ],
    targets: [
        .target(
            name: "WeMeal",
            dependencies: [
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk")
            ],
            path: "WeMeal"),
    ]
)
